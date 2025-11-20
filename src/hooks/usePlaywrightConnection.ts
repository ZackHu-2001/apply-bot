import { useState, useEffect, useCallback, useRef } from 'react'

const DEFAULT_MCP_RELAY_URL = 'ws://localhost:3000'
const EXTENSION_NAMESPACE = 'playwright-mcp-bridge'

export interface PlaywrightConnectionStatus {
  connected: boolean
  connectedTabId: number | null
  extensionInstalled: boolean
  connecting: boolean
  error: string | null
}

// Generate unique request IDs
let nextRequestId = 1
const generateRequestId = () => `req_${nextRequestId++}_${Date.now()}`

export function usePlaywrightConnection() {
  const [status, setStatus] = useState<PlaywrightConnectionStatus>({
    connected: false,
    connectedTabId: null,
    extensionInstalled: false,
    connecting: false,
    error: null,
  })

  // Store pending requests
  const pendingRequests = useRef<Map<string, {
    resolve: (value: any) => void
    reject: (error: any) => void
    timeout: NodeJS.Timeout
  }>>(new Map())

  // Send a message to the extension via content script
  const sendMessage = useCallback((type: string, payload: any = {}): Promise<any> => {
    return new Promise((resolve, reject) => {
      const requestId = generateRequestId()

      // Set up timeout (5 seconds)
      const timeout = setTimeout(() => {
        pendingRequests.current.delete(requestId)
        reject(new Error('Request timeout'))
      }, 5000)

      // Store the request
      pendingRequests.current.set(requestId, { resolve, reject, timeout })

      // Send the message
      window.postMessage({
        namespace: EXTENSION_NAMESPACE,
        type,
        requestId,
        payload,
      }, '*')
    })
  }, [])

  // Listen for messages from the content script
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from the same window
      if (event.source !== window)
        return

      const data = event.data
      if (data?.namespace !== EXTENSION_NAMESPACE)
        return

      // Handle "ready" message from content script
      if (data.type === 'ready') {
        setStatus(prev => ({
          ...prev,
          extensionInstalled: true,
          error: null
        }))
        return
      }

      // Handle response messages
      if (data.type === 'response') {
        const { requestId, success, payload, error } = data
        const pending = pendingRequests.current.get(requestId)

        if (pending) {
          clearTimeout(pending.timeout)
          pendingRequests.current.delete(requestId)

          if (success) {
            pending.resolve(payload)
          } else {
            pending.reject(new Error(error || 'Unknown error'))
          }
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Check if extension is installed (wait for ready message or actively probe)
  useEffect(() => {
    // Actively probe for extension after a short delay
    const probeTimeout = setTimeout(async () => {
      if (!status.extensionInstalled) {
        try {
          // Try to send a test message
          await sendMessage('getConnectionStatus')
          // If we get here without error, extension is installed
          setStatus(prev => ({
            ...prev,
            extensionInstalled: true,
            error: null
          }))
        } catch (error) {
          // Extension not responding
          setStatus(prev => ({
            ...prev,
            extensionInstalled: false,
            error: 'Extension not detected. Please install the Playwright MCP Bridge extension.'
          }))
        }
      }
    }, 500)

    return () => clearTimeout(probeTimeout)
  }, [status.extensionInstalled, sendMessage])

  // Check connection status
  const checkStatus = useCallback(async () => {
    if (!status.extensionInstalled) return

    try {
      const response = await sendMessage('getConnectionStatus')
      if (response) {
        setStatus(prev => ({
          ...prev,
          connected: response.connected || false,
          connectedTabId: response.connectedTabId || null,
          error: null,
        }))
      }
    } catch (error) {
      // Silently ignore - extension might not be ready yet
    }
  }, [status.extensionInstalled, sendMessage])

  // Connect to current tab
  const connect = useCallback(async (mcpRelayUrl: string = DEFAULT_MCP_RELAY_URL) => {
    if (!status.extensionInstalled) {
      const errorMsg = 'Extension not installed'
      setStatus(prev => ({ ...prev, error: errorMsg }))
      return { success: false, error: errorMsg }
    }

    setStatus(prev => ({ ...prev, connecting: true, error: null }))

    try {
      const response = await sendMessage('connectToCurrentTab', { mcpRelayUrl })

      if (response?.success) {
        setStatus(prev => ({
          ...prev,
          connected: true,
          connectedTabId: response.connectedTabId,
          connecting: false,
          error: null,
        }))
        return { success: true }
      } else {
        const errorMsg = response?.error || 'Failed to connect'
        setStatus(prev => ({
          ...prev,
          connecting: false,
          error: errorMsg,
        }))
        return { success: false, error: errorMsg }
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to communicate with extension'
      setStatus(prev => ({
        ...prev,
        connecting: false,
        error: errorMsg,
      }))
      return { success: false, error: errorMsg }
    }
  }, [status.extensionInstalled, sendMessage])

  // Disconnect
  const disconnect = useCallback(async () => {
    if (!status.extensionInstalled) {
      return { success: false, error: 'Extension not installed' }
    }

    try {
      const response = await sendMessage('disconnect')

      if (response?.success) {
        setStatus(prev => ({
          ...prev,
          connected: false,
          connectedTabId: null,
          error: null,
        }))
        return { success: true }
      }
      return { success: false, error: response?.error || 'Failed to disconnect' }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, [status.extensionInstalled, sendMessage])

  // Periodic status updates
  useEffect(() => {
    if (!status.extensionInstalled) return

    // Initial check
    checkStatus()

    // Poll status every 2 seconds when connected or connecting
    const interval = setInterval(() => {
      if (status.connected || status.connecting) {
        checkStatus()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [checkStatus, status.connected, status.connecting, status.extensionInstalled])

  return {
    status,
    connect,
    disconnect,
    checkStatus,
  }
}
