import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X, Info, Plus, Trash2, Save, HelpCircle, Edit2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface ResumeFile {
  name: string
  type: string
  size: number
  uploadedAt: string
}

interface CurrentResume {
  exists: boolean
  sourceFile: string | null
  parsedAt: string | null
  textLength: number
}

interface JobFilter {
  id: string
  name: string
  type: 'select' | 'multiselect' | 'text' | 'number' | 'boolean' | 'list'
  description: string
  aiExplanation: string
  value: any
  enabled?: boolean
  options?: string[]
  placeholder?: string
  min?: number
  max?: number
  currency?: string
}

export default function Config() {
  const [resumeFiles, setResumeFiles] = useState<ResumeFile[]>([])
  const [currentResume, setCurrentResume] = useState<CurrentResume | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [parsingStatus, setParsingStatus] = useState<Record<string, 'parsing' | 'success' | 'error'>>({})
  const [parsingMessage, setParsingMessage] = useState<Record<string, string>>({})
  const [jobFilters, setJobFilters] = useState<JobFilter[]>([])
  const [isLoadingFilters, setIsLoadingFilters] = useState(true)
  const [isCreatingFilter, setIsCreatingFilter] = useState(false)
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null)
  const [editFilter, setEditFilter] = useState<Partial<JobFilter>>({})
  const [newFilter, setNewFilter] = useState<Partial<JobFilter>>({
    type: 'text',
    value: '',
    options: [],
    enabled: true,
  })
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    fetchResumes()
    fetchCurrentResume()
    fetchJobFilters()
  }, [])

  const fetchCurrentResume = async () => {
    try {
      const response = await fetch('/api/resume')
      const data = await response.json()
      setCurrentResume(data)
    } catch (error) {
      console.error('Failed to load current resume:', error)
      setCurrentResume(null)
    }
  }

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resumes')
      const data = await response.json()
      setResumeFiles(data || [])
    } catch (error) {
      console.error('Failed to load resumes:', error)
      setResumeFiles([])
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Only allow PDF files
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        await fetchResumes()
        setUploadProgress(100)
        setTimeout(() => {
          setUploadProgress(0)
          setIsUploading(false)
        }, 1000)
      } else {
        let errorMessage = 'Failed to upload resume'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If response is not JSON, try to get text
          try {
            const text = await response.text()
            errorMessage = text || errorMessage
          } catch (e2) {
            errorMessage = `Server error: ${response.status} ${response.statusText}`
          }
        }
        console.error('Upload failed:', response.status, errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Failed to upload resume:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error instanceof TypeError && error.message.includes('fetch') 
          ? 'Network error. Please check if the server is running.' 
          : 'Failed to upload resume. Please try again.')
      alert(errorMessage)
      setIsUploading(false)
      setUploadProgress(0)
    }

    // Reset input
    event.target.value = ''
  }

  const handleDeleteResume = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/resumes/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchResumes()
      } else {
        throw new Error('Failed to delete resume')
      }
    } catch (error) {
      console.error('Failed to delete resume:', error)
      alert('Failed to delete resume. Please try again.')
    }
  }

  const handleParseResume = async (fileName: string) => {
    setParsingStatus(prev => ({ ...prev, [fileName]: 'parsing' }))
    setParsingMessage(prev => ({ ...prev, [fileName]: 'Parsing resume...' }))

    try {
      const response = await fetch(`/api/resumes/parse/${encodeURIComponent(fileName)}`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setParsingStatus(prev => ({ ...prev, [fileName]: 'success' }))
        setParsingMessage(prev => ({
          ...prev,
          [fileName]: 'Resume parsed successfully! Text saved to resume.txt.'
        }))

        // Fetch the updated current resume
        await fetchCurrentResume()

        // Clear success message after 5 seconds
        setTimeout(() => {
          setParsingStatus(prev => {
            const newStatus = { ...prev }
            delete newStatus[fileName]
            return newStatus
          })
          setParsingMessage(prev => {
            const newMessage = { ...prev }
            delete newMessage[fileName]
            return newMessage
          })
        }, 5000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to parse resume')
      }
    } catch (error) {
      console.error('Failed to parse resume:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse resume. Please try again.'
      setParsingStatus(prev => ({ ...prev, [fileName]: 'error' }))
      setParsingMessage(prev => ({ ...prev, [fileName]: errorMessage }))

      // Clear error message after 5 seconds
      setTimeout(() => {
        setParsingStatus(prev => {
          const newStatus = { ...prev }
          delete newStatus[fileName]
          return newStatus
        })
        setParsingMessage(prev => {
          const newMessage = { ...prev }
          delete newMessage[fileName]
          return newMessage
        })
      }, 5000)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const fetchJobFilters = async () => {
    try {
      setIsLoadingFilters(true)
      const response = await fetch('/api/job-filters')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Loaded job filters:', data.filters?.length || 0)
      // Sort filters: enabled first, then disabled
      const sortedFilters = (data.filters || []).sort((a: JobFilter, b: JobFilter) => {
        const aEnabled = a.enabled ?? true
        const bEnabled = b.enabled ?? true
        if (aEnabled === bEnabled) return 0
        return aEnabled ? -1 : 1
      })
      setJobFilters(sortedFilters)
    } catch (error) {
      console.error('Failed to load job filters:', error)
      setJobFilters([])
    } finally {
      setIsLoadingFilters(false)
    }
  }

  const handleFilterChange = async (filterId: string, newValue: any) => {
    const updatedFilters = jobFilters.map(filter =>
      filter.id === filterId ? { ...filter, value: newValue } : filter
    )
    setJobFilters(updatedFilters)

    try {
      const response = await fetch('/api/job-filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters: updatedFilters }),
      })

      if (!response.ok) {
        throw new Error('Failed to save filter')
      }
    } catch (error) {
      console.error('Failed to save filter:', error)
      alert('Failed to save filter. Please try again.')
      fetchJobFilters() // Revert on error
    }
  }

  const handleToggleEnabled = async (filterId: string) => {
    const filter = jobFilters.find(f => f.id === filterId)
    if (!filter) return

    const updatedFilters = jobFilters.map(f =>
      f.id === filterId ? { ...f, enabled: !(f.enabled ?? true) } : f
    )
    // Sort filters: enabled first, then disabled
    const sortedFilters = updatedFilters.sort((a, b) => {
      const aEnabled = a.enabled ?? true
      const bEnabled = b.enabled ?? true
      if (aEnabled === bEnabled) return 0
      return aEnabled ? -1 : 1
    })
    setJobFilters(sortedFilters)

    try {
      const response = await fetch('/api/job-filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters: updatedFilters }),
      })

      if (!response.ok) {
        throw new Error('Failed to update filter')
      }
    } catch (error) {
      console.error('Failed to update filter:', error)
      alert('Failed to update filter. Please try again.')
      fetchJobFilters() // Revert on error
    }
  }

  const handleStartEdit = (filter: JobFilter) => {
    setEditingFilterId(filter.id)
    setEditFilter({ ...filter })
  }

  const handleSaveEdit = async () => {
    if (!editingFilterId || !editFilter.name || !editFilter.type || !editFilter.aiExplanation) {
      alert('Please fill in name, type, and AI explanation')
      return
    }

    const updatedFilters = jobFilters.map(filter =>
      filter.id === editingFilterId ? { ...editFilter, id: editingFilterId } as JobFilter : filter
    )
    setJobFilters(updatedFilters)
    setEditingFilterId(null)
    setEditFilter({})
    setCurrentPage(1) // Reset to first page after edit

    try {
      const response = await fetch('/api/job-filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters: updatedFilters }),
      })

      if (!response.ok) {
        throw new Error('Failed to update filter')
      }
    } catch (error) {
      console.error('Failed to update filter:', error)
      alert('Failed to update filter. Please try again.')
      fetchJobFilters() // Revert on error
    }
  }

  const handleCancelEdit = () => {
    setEditingFilterId(null)
    setEditFilter({})
  }

  const handleDeleteFilter = async (filterId: string) => {
    if (!confirm('Are you sure you want to delete this filter?')) {
      return
    }

    const updatedFilters = jobFilters.filter(filter => filter.id !== filterId)
    setJobFilters(updatedFilters)

    try {
      const response = await fetch('/api/job-filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters: updatedFilters }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete filter')
      }
    } catch (error) {
      console.error('Failed to delete filter:', error)
      alert('Failed to delete filter. Please try again.')
      fetchJobFilters() // Revert on error
    }
  }

  const handleMoveFilter = async (filterId: string, direction: 'up' | 'down') => {
    const index = jobFilters.findIndex(f => f.id === filterId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= jobFilters.length) return

    const updatedFilters = [...jobFilters]
    const [movedFilter] = updatedFilters.splice(index, 1)
    updatedFilters.splice(newIndex, 0, movedFilter)
    setJobFilters(updatedFilters)

    try {
      const response = await fetch('/api/job-filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters: updatedFilters }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder filter')
      }
    } catch (error) {
      console.error('Failed to reorder filter:', error)
      alert('Failed to reorder filter. Please try again.')
      fetchJobFilters()
    }
  }

  const handleCreateFilter = async () => {
    if (!newFilter.name || !newFilter.type || !newFilter.aiExplanation) {
      alert('Please fill in name, type, and AI explanation')
      return
    }

    const filter: JobFilter = {
      id: `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newFilter.name,
      type: newFilter.type as JobFilter['type'],
      description: newFilter.description || '',
      aiExplanation: newFilter.aiExplanation || '',
      value: newFilter.type === 'boolean' ? false : newFilter.type === 'number' ? 0 : (newFilter.type === 'multiselect' || newFilter.type === 'list') ? [] : '',
      enabled: newFilter.enabled ?? true,
      options: newFilter.options || [],
      placeholder: newFilter.placeholder,
      min: newFilter.min,
      max: newFilter.max,
      currency: newFilter.currency,
    }

    const updatedFilters = [...jobFilters, filter]
    setJobFilters(updatedFilters)
    setIsCreatingFilter(false)
    setNewFilter({ type: 'text', value: '', options: [], enabled: true })

    try {
      const response = await fetch('/api/job-filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters: updatedFilters }),
      })

      if (!response.ok) {
        throw new Error('Failed to create filter')
      }
    } catch (error) {
      console.error('Failed to create filter:', error)
      alert('Failed to create filter. Please try again.')
      fetchJobFilters() // Revert on error
    }
  }

  const renderFilterInput = (filter: JobFilter) => {
    switch (filter.type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={filter.value || false}
              onCheckedChange={(checked) => handleFilterChange(filter.id, checked)}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {filter.value ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        )

      case 'number':
        return (
          <div className="flex items-center gap-2">
            {filter.currency && (
              <span className="text-sm text-gray-500 dark:text-gray-400">{filter.currency}</span>
            )}
            <input
              type="number"
              value={filter.value || 0}
              onChange={(e) => handleFilterChange(filter.id, parseFloat(e.target.value) || 0)}
              min={filter.min}
              max={filter.max}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )

      case 'select':
        return (
          <select
            value={filter.value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {filter.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'list':
        const listValue = Array.isArray(filter.value) ? filter.value : []
        return (
          <div className="space-y-2">
            {/* List items */}
            <div className="space-y-1">
              {listValue.map((item, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newValues = [...listValue]
                      newValues[index] = e.target.value
                      handleFilterChange(filter.id, newValues)
                    }}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newValues = listValue.filter((_, i) => i !== index)
                      handleFilterChange(filter.id, newValues)
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {/* Add new item */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={filter.placeholder || 'Add new item...'}
                className="flex-1 px-3 py-1.5 text-sm border border-dashed border-gray-300 dark:border-stone-600 rounded-lg bg-gray-50 dark:bg-stone-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-solid focus:bg-white dark:focus:bg-stone-800"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                    const newValue = (e.target as HTMLInputElement).value.trim()
                    handleFilterChange(filter.id, [...listValue, newValue])
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = (e.target as HTMLElement).parentElement?.querySelector('input')
                  if (input && input.value.trim()) {
                    handleFilterChange(filter.id, [...listValue, input.value.trim()])
                    input.value = ''
                  }
                }}
                className="p-1.5 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {listValue.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {listValue.length} item{listValue.length !== 1 ? 's' : ''} in list
              </div>
            )}
          </div>
        )

      case 'multiselect':
        const multiselectValue = Array.isArray(filter.value) ? filter.value : []
        return (
          <div className="space-y-2">
            <textarea
              value={multiselectValue.join('\n')}
              onChange={(e) => {
                const values = e.target.value.split('\n').filter(v => v.trim())
                handleFilterChange(filter.id, values)
              }}
              placeholder={filter.placeholder || 'Enter values, one per line'}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {filter.options && filter.options.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filter.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      const newValue = multiselectValue.includes(option)
                        ? multiselectValue.filter(v => v !== option)
                        : [...multiselectValue, option]
                      handleFilterChange(filter.id, newValue)
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      multiselectValue.includes(option)
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'bg-gray-100 dark:bg-stone-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )

      case 'text':
      default:
        return (
          <input
            type="text"
            value={filter.value || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            placeholder={filter.placeholder}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Configuration
      </h2>

      <div className="space-y-6">
        {/* Resume Upload Section */}
        <Card className="border-gray-200 dark:border-stone-700 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 to-white dark:from-blue-900/20 dark:to-stone-800/50 border-b border-gray-200 dark:border-stone-700">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Resume Management</CardTitle>
                <CardDescription>
                  Upload and manage your resume files. Only PDF files are supported.
                </CardDescription>
              </div>
              <div className="group relative">
                <Info className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 cursor-help flex-shrink-0" />
                <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-gray-900 dark:bg-stone-800 text-white dark:text-gray-100 text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  <p>AI will automatically extract information from your uploaded resume to fill out job application forms and optimize your answers based on your experience and skills.</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Current Resume Display */}
              {currentResume?.exists && currentResume.sourceFile && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Currently Active Resume
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <span className="font-medium">{currentResume.sourceFile}</span>
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {currentResume.parsedAt && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            Parsed on {formatDate(currentResume.parsedAt)}
                          </p>
                        )}
                        {currentResume.textLength && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            • {currentResume.textLength.toLocaleString()} characters extracted
                          </p>
                        )}
                      </div>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  </div>
                </div>
              )}

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-stone-600 rounded-lg p-6 text-center hover:border-primary-400 dark:hover:border-primary-600 transition-colors">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <label
                  htmlFor="resume-upload"
                  className={`cursor-pointer flex flex-col items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      Click to upload
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400"> or drag and drop</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF only (MAX. 10MB)</p>
                </label>
                {isUploading && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 dark:bg-stone-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
        </div>

              {/* Resume List */}
              {resumeFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Uploaded Resumes
                  </h4>
                  {resumeFiles.map((file, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-stone-900/50 rounded-lg border border-gray-200 dark:border-stone-700"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleParseResume(file.name)}
                            variant="outline"
                            size="sm"
                            disabled={parsingStatus[file.name] === 'parsing'}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border-blue-300 dark:border-blue-700"
                          >
                            {parsingStatus[file.name] === 'parsing' ? (
                              <>Parsing...</>
                            ) : (
                              <>Parse</>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleDeleteResume(file.name)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {parsingStatus[file.name] && (
                        <div
                          className={`px-3 py-2 rounded-lg text-sm ${
                            parsingStatus[file.name] === 'success'
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                              : parsingStatus[file.name] === 'error'
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {parsingMessage[file.name]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {resumeFiles.length === 0 && !isUploading && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No resumes uploaded yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Filters Section */}
        <Card className="border-gray-200 dark:border-stone-700 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50/50 to-white dark:from-purple-900/20 dark:to-stone-800/50 border-b border-gray-200 dark:border-stone-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Job Filters</CardTitle>
                <CardDescription>
                  Configure filters for job applications. Each filter includes AI instructions on how to use it.
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreatingFilter(true)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingFilters ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Loading filters...
              </div>
            ) : (
              <div className="space-y-6">
                {/* Create New Filter Form */}
                {isCreatingFilter && (
                  <div className="p-4 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Create New Filter</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={newFilter.name || ''}
                          onChange={(e) => setNewFilter({ ...newFilter, name: e.target.value })}
                          placeholder="e.g., Blacklist Companies"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Type *
                        </label>
                        <select
                          value={newFilter.type || 'text'}
                          onChange={(e) => setNewFilter({ ...newFilter, type: e.target.value as JobFilter['type'] })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean (Yes/No)</option>
                          <option value="select">Select (Single Choice)</option>
                          <option value="multiselect">Multi-Select (Multiple Choices)</option>
                          <option value="list">List (One per line, e.g., blacklist)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={newFilter.description || ''}
                          onChange={(e) => setNewFilter({ ...newFilter, description: e.target.value })}
                          placeholder="Brief description of this filter"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          AI Explanation *
                        </label>
                        <textarea
                          value={newFilter.aiExplanation || ''}
                          onChange={(e) => setNewFilter({ ...newFilter, aiExplanation: e.target.value })}
                          placeholder="Explain to AI how to use this filter when processing job applications..."
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                      {(newFilter.type === 'select' || newFilter.type === 'multiselect') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Options (one per line)
                          </label>
                          <textarea
                            value={(newFilter.options || []).join('\n')}
                            onChange={(e) => setNewFilter({ ...newFilter, options: e.target.value.split('\n').filter(v => v.trim()) })}
                            placeholder="Enter options, one per line"
                            rows={4}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                        </div>
                      )}
                      {newFilter.type === 'number' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Min
                              </label>
                              <input
                                type="number"
                                value={newFilter.min || ''}
                                onChange={(e) => setNewFilter({ ...newFilter, min: parseFloat(e.target.value) || undefined })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Max
                              </label>
                              <input
                                type="number"
                                value={newFilter.max || ''}
                                onChange={(e) => setNewFilter({ ...newFilter, max: parseFloat(e.target.value) || undefined })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Currency (optional)
                            </label>
                            <input
                              type="text"
                              value={newFilter.currency || ''}
                              onChange={(e) => setNewFilter({ ...newFilter, currency: e.target.value })}
                              placeholder="e.g., CAD, USD"
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </>
                      )}
                      {newFilter.type === 'text' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Placeholder (optional)
                          </label>
                          <input
                            type="text"
                            value={newFilter.placeholder || ''}
                            onChange={(e) => setNewFilter({ ...newFilter, placeholder: e.target.value })}
                            placeholder="Placeholder text for the input"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button onClick={handleCreateFilter} size="sm">
                          <Save className="h-4 w-4 mr-1" />
                          Create
                        </Button>
                        <Button
                          onClick={() => {
                            setIsCreatingFilter(false)
                            setNewFilter({ type: 'text', value: '', options: [] })
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
        </div>
                )}

                {/* Filters List */}
                {jobFilters.length === 0 && !isCreatingFilter ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p className="text-lg mb-2">No filters configured</p>
                    <p className="text-sm">Click "Add Filter" to create your first filter</p>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const totalPages = Math.ceil(jobFilters.length / ITEMS_PER_PAGE)
                      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
                      const endIndex = startIndex + ITEMS_PER_PAGE
                      const paginatedFilters = jobFilters.slice(startIndex, endIndex)
                      
                      return (
                        <>
                          {paginatedFilters.map((filter, paginatedIndex) => {
                    const isEditing = editingFilterId === filter.id
                    const isEnabled = filter.enabled ?? true
                    const actualIndex = startIndex + paginatedIndex
                    const isFirst = actualIndex === 0
                    const isLast = actualIndex === jobFilters.length - 1

                    return (
                      <div
                        key={filter.id}
                        className={`p-4 border rounded-lg transition-all ${
                          isEnabled
                            ? 'border-gray-200 dark:border-stone-700 bg-white dark:bg-stone-800'
                            : 'border-gray-300 dark:border-stone-600 bg-gray-50 dark:bg-stone-900/50 opacity-50'
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name *
                              </label>
                              <input
                                type="text"
                                value={editFilter.name || ''}
                                onChange={(e) => setEditFilter({ ...editFilter, name: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Type *
                              </label>
                              <select
                                value={editFilter.type || 'text'}
                                onChange={(e) => setEditFilter({ ...editFilter, type: e.target.value as JobFilter['type'] })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean (Yes/No)</option>
                                <option value="select">Select (Single Choice)</option>
                                <option value="multiselect">Multi-Select (Multiple Choices)</option>
                                <option value="list">List (One per line, e.g., blacklist)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                              </label>
                              <input
                                type="text"
                                value={editFilter.description || ''}
                                onChange={(e) => setEditFilter({ ...editFilter, description: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                AI Explanation *
                              </label>
                              <textarea
                                value={editFilter.aiExplanation || ''}
                                onChange={(e) => setEditFilter({ ...editFilter, aiExplanation: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              />
                            </div>
                            {(editFilter.type === 'select' || editFilter.type === 'multiselect') && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Options (one per line)
                                </label>
                                <textarea
                                  value={(editFilter.options || []).join('\n')}
                                  onChange={(e) => setEditFilter({ ...editFilter, options: e.target.value.split('\n').filter(v => v.trim()) })}
                                  rows={4}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Button onClick={handleSaveEdit} size="sm">
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button onClick={handleCancelEdit} variant="outline" size="sm">
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleDeleteFilter(editingFilterId)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className={`text-lg font-semibold ${isEnabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {filter.name}
          </h3>
                                  <span className={`px-2 py-0.5 text-xs rounded ${isEnabled ? 'bg-gray-100 dark:bg-stone-700 text-gray-600 dark:text-gray-400' : 'bg-gray-200 dark:bg-stone-800 text-gray-400 dark:text-gray-600'}`}>
                                    {filter.type}
                                  </span>
                                </div>
                                {filter.description && (
                                  <p className={`text-sm mb-2 ${isEnabled ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>
                                    {filter.description}
                                  </p>
                                )}
                                <div className="group relative inline-block">
                                  <div className={`flex items-center gap-1 text-xs cursor-help ${isEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}>
                                    <HelpCircle className="h-3 w-3" />
                                    <span>AI Instructions</span>
                                  </div>
                                  <div className="absolute left-0 top-full mt-2 w-96 p-3 bg-gray-900 dark:bg-stone-800 text-white dark:text-gray-100 text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                    {filter.aiExplanation}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="flex flex-col">
                                  <button
                                    onClick={() => handleMoveFilter(filter.id, 'up')}
                                    disabled={isFirst}
                                    className="p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleMoveFilter(filter.id, 'down')}
                                    disabled={isLast}
                                    className="p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </button>
                                </div>
                                <Button
                                  onClick={() => handleStartEdit(filter)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Switch
                                  checked={isEnabled}
                                  onCheckedChange={() => handleToggleEnabled(filter.id)}
                                />
                              </div>
                            </div>
                            <div className={`mt-4 ${!isEnabled ? 'pointer-events-none opacity-50' : ''}`}>
                              {renderFilterInput(filter)}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-stone-700">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                  disabled={currentPage === 1}
                                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-stone-800 border border-gray-300 dark:border-stone-600 rounded-lg hover:bg-gray-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                  Previous
                                </button>
                                <button
                                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                  disabled={currentPage === totalPages}
                                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-stone-800 border border-gray-300 dark:border-stone-600 rounded-lg hover:bg-gray-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                >
                                  Next
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </>
                )}
        </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
