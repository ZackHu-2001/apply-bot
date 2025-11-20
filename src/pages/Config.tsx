import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X, Check, Info } from 'lucide-react'

interface ResumeFile {
  name: string
  type: string
  size: number
  uploadedAt: string
}

export default function Config() {
  const [resumeFiles, setResumeFiles] = useState<ResumeFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchResumes()
  }, [])

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
        const result = await response.json()
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
                    <div
                      key={index}
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
                      <Button
                        onClick={() => handleDeleteResume(file.name)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
            <CardTitle className="text-xl font-semibold">Job Filters</CardTitle>
            <CardDescription>
              Configure filters for job applications including blacklist, whitelist, and salary preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Blacklist Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Blacklist
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Companies or keywords to automatically skip
                </p>
                {/* Blacklist form will go here */}
                <div className="p-4 bg-gray-50 dark:bg-stone-900/50 rounded-lg border border-gray-200 dark:border-stone-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Blacklist configuration coming soon...
                  </p>
                </div>
              </div>

              {/* Whitelist Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Whitelist
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Companies to prioritize
                </p>
                {/* Whitelist form will go here */}
                <div className="p-4 bg-gray-50 dark:bg-stone-900/50 rounded-lg border border-gray-200 dark:border-stone-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Whitelist configuration coming soon...
                  </p>
                </div>
              </div>

              {/* Salary Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Salary Preferences
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Minimum salary requirements
                </p>
                {/* Salary form will go here */}
                <div className="p-4 bg-gray-50 dark:bg-stone-900/50 rounded-lg border border-gray-200 dark:border-stone-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Salary configuration coming soon...
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
