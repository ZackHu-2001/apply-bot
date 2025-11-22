import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Edit2, Save, X, Plus, Trash2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'

interface KnowledgeEntry {
  question: string
  assumedAnswer?: string
  answer?: string
  timestamp: string
  updatedAt?: string
}

const API_BASE_URL = '/api'

export default function KnowledgeBase() {
  const [questions, setQuestions] = useState<KnowledgeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'unanswered' | 'answered'>('answered')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<{ question: string; answer: string }>({ question: '', answer: '' })
  const [newAnswer, setNewAnswer] = useState<{ [key: number]: string }>({})
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newKnowledge, setNewKnowledge] = useState<{ question: string; answer: string }>({ question: '', answer: '' })
  const [currentPage, setCurrentPage] = useState(1)
  
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/unknown`)
      const data = await response.json()
      setQuestions(data || [])
    } catch (error) {
      console.error('Failed to load questions:', error)
      setQuestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAnswer = async (index: number) => {
    const answer = newAnswer[index]?.trim()
    if (!answer) {
      alert('Please enter an answer')
      return
    }

    try {
      const updatedQuestions = [...questions]
      const now = new Date().toISOString()
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        answer: answer,
        updatedAt: now,
        timestamp: updatedQuestions[index].timestamp || now
      }

      const response = await fetch(`${API_BASE_URL}/unknown`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuestions),
      })

      if (response.ok) {
        setQuestions(updatedQuestions)
        setNewAnswer({ ...newAnswer, [index]: '' })
        setActiveTab('answered') // Switch to answered tab after saving
      } else {
        throw new Error('Failed to save answer')
      }
    } catch (error) {
      console.error('Failed to save answer:', error)
      alert('Failed to save answer. Please try again.')
    }
  }

  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setEditForm({
      question: questions[index].question,
      answer: questions[index].answer || questions[index].assumedAnswer || ''
    })
  }

  const handleSaveEdit = async () => {
    if (editingIndex === null) return

    try {
      const updatedQuestions = [...questions]
      const now = new Date().toISOString()
      updatedQuestions[editingIndex] = {
        ...updatedQuestions[editingIndex],
        question: editForm.question,
        answer: editForm.answer,
        updatedAt: now,
        // Also update timestamp if it doesn't exist (for backward compatibility)
        timestamp: updatedQuestions[editingIndex].timestamp || now,
      }

      const response = await fetch(`${API_BASE_URL}/unknown`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuestions),
      })

      if (response.ok) {
        setQuestions(updatedQuestions)
        setEditingIndex(null)
        setEditForm({ question: '', answer: '' })
        setCurrentPage(1) // Reset to first page after edit
      } else {
        throw new Error('Failed to update question')
      }
    } catch (error) {
      console.error('Failed to update question:', error)
      alert('Failed to update question. Please try again.')
    }
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditForm({ question: '', answer: '' })
  }

  const handleCreateNew = () => {
    setIsCreatingNew(true)
    setNewKnowledge({ question: '', answer: '' })
    setActiveTab('answered') // Switch to answered tab when creating new
  }

  const handleSaveNew = async () => {
    if (!newKnowledge.question.trim() || !newKnowledge.answer.trim()) {
      alert('Please fill in both question and answer')
      return
    }

    try {
      const newQuestion: KnowledgeEntry = {
        question: newKnowledge.question.trim(),
        answer: newKnowledge.answer.trim(),
        timestamp: new Date().toISOString()
      }

      const updatedQuestions = [...questions, newQuestion]

      const response = await fetch(`${API_BASE_URL}/unknown`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuestions),
      })

      if (response.ok) {
        setQuestions(updatedQuestions)
        setIsCreatingNew(false)
        setNewKnowledge({ question: '', answer: '' })
      } else {
        throw new Error('Failed to create new entry')
      }
    } catch (error) {
      console.error('Failed to create new entry:', error)
      alert('Failed to create new entry. Please try again.')
    }
  }

  const handleCancelNew = () => {
    setIsCreatingNew(false)
    setNewKnowledge({ question: '', answer: '' })
  }

  const handleDelete = async (index: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return
    }

    try {
      const updatedQuestions = questions.filter((_, i) => i !== index)
      const response = await fetch(`${API_BASE_URL}/unknown`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuestions),
      })

      if (response.ok) {
        setQuestions(updatedQuestions)
        setEditingIndex(null)
        setEditForm({ question: '', answer: '' })
        setCurrentPage(1) // Reset to first page after delete
      } else {
        throw new Error('Failed to delete entry')
      }
    } catch (error) {
      console.error('Failed to delete entry:', error)
      alert('Failed to delete entry. Please try again.')
    }
  }

  const handleMoveQuestion = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= questions.length) return

    const updatedQuestions = [...questions]
    const [movedQuestion] = updatedQuestions.splice(index, 1)
    updatedQuestions.splice(newIndex, 0, movedQuestion)

    try {
      const response = await fetch(`${API_BASE_URL}/unknown`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuestions),
      })

      if (response.ok) {
        setQuestions(updatedQuestions)
      } else {
        throw new Error('Failed to reorder entry')
      }
    } catch (error) {
      console.error('Failed to reorder entry:', error)
      alert('Failed to reorder entry. Please try again.')
    }
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

  const unansweredQuestions = questions.filter(q => !q.answer)

  const answeredQuestions = questions.filter(q => q.answer)

  // Auto-switch to answered tab if unanswered is empty and answered has items
  useEffect(() => {
    if (!isLoading && unansweredQuestions.length === 0 && answeredQuestions.length > 0 && activeTab === 'unanswered') {
      setActiveTab('answered')
    }
  }, [isLoading, unansweredQuestions.length, answeredQuestions.length, activeTab])


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Memory
          </h2>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {isLoading ? (
            'Loading...'
          ) : (
            `Total: ${questions.length} | Pending: ${unansweredQuestions.length}`
          )}
        </div>
      </div>

      {isLoading ? (
        <Card className="border-gray-200 dark:border-stone-700 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          </CardContent>
        </Card>
      ) : questions.length === 0 ? (
        <Card className="border-gray-200 dark:border-stone-700 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">No unknown questions</p>
              <p className="text-sm">When AI encounters questions it cannot determine, they will be recorded here</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'unanswered' | 'answered')}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="answered">
                Memory
                {answeredQuestions.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                    {answeredQuestions.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="unanswered" className="relative">
                Pending
                {unansweredQuestions.length > 0 && (
                  <>
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                      {unansweredQuestions.length}
                    </span>
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-stone-800"></span>
                  </>
                )}
              </TabsTrigger>
            </TabsList>
            <Button onClick={handleCreateNew} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Entry
            </Button>
          </div>

          <TabsContent value="unanswered">
            <Card className="border-gray-200 dark:border-stone-700 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-orange-50/50 to-white dark:from-orange-900/20 dark:to-stone-800/50 border-b border-gray-200 dark:border-stone-700">
                <CardTitle className="text-xl font-semibold">Pending Questions</CardTitle>
                <CardDescription>
                  These are questions that AI encountered but don't have answers yet. Please fill in the answers and save them.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {unansweredQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      <p className="text-lg mb-2">No pending questions</p>
                      <p className="text-sm">All questions have been answered!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {unansweredQuestions.map((question, index) => {
                      // Find original index using timestamp and question combination
                      const originalIndex = questions.findIndex(
                        q => q.timestamp === question.timestamp && q.question === question.question
                      )
                      return (
                        <div
                          key={`${question.timestamp}-${index}`}
                          className="p-4 border border-gray-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800"
                        >
                          <div className="mb-3 flex items-start gap-4">
                            <div className="flex-1">
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                {formatDate(question.timestamp)}
                              </div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {question.question}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleSaveAnswer(originalIndex)}
                                size="sm"
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button
                                onClick={() => handleDelete(originalIndex)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <textarea
                              value={newAnswer[originalIndex] || ''}
                              onChange={(e) =>
                                setNewAnswer({ ...newAnswer, [originalIndex]: e.target.value })
                              }
                              placeholder={question.assumedAnswer ? `Assumed answer: ${question.assumedAnswer}` : "Enter your answer..."}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                              rows={3}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="answered">
            <Card className="border-gray-200 dark:border-stone-700 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-green-50/50 to-white dark:from-green-900/20 dark:to-stone-800/50 border-b border-gray-200 dark:border-stone-700">
                <CardTitle className="text-xl font-semibold">Memory</CardTitle>
                <CardDescription>
                  Tell AI how you want it to answer questions. AI will use these memories to fill out applications.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {isCreatingNew && (
                  <div className="mb-4 p-4 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg bg-primary-50/50 dark:bg-primary-900/20">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Question:
                        </label>
                        <input
                          type="text"
                          value={newKnowledge.question}
                          onChange={(e) =>
                            setNewKnowledge({ ...newKnowledge, question: e.target.value })
                          }
                          placeholder="Enter the question..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Answer:
                        </label>
                        <textarea
                          value={newKnowledge.answer}
                          onChange={(e) =>
                            setNewKnowledge({ ...newKnowledge, answer: e.target.value })
                          }
                          placeholder="Enter the answer..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveNew} size="sm">
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelNew}
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
                {answeredQuestions.length === 0 && !isCreatingNew ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">
                      <p className="text-lg mb-2">No memory entries yet</p>
                      <p className="text-sm mb-4">Click "New Entry" to create your first entry</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const totalPages = Math.ceil(answeredQuestions.length / ITEMS_PER_PAGE)
                      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
                      const endIndex = startIndex + ITEMS_PER_PAGE
                      const paginatedQuestions = answeredQuestions.slice(startIndex, endIndex)
                      
                      return (
                        <>
                          <div className="space-y-4">
                            {paginatedQuestions.map((question, paginatedIndex) => {
                      // Find original index using timestamp and question combination
                      const originalIndex = questions.findIndex(
                        q => q.timestamp === question.timestamp && q.question === question.question
                      )
                      const isEditing = editingIndex === originalIndex
                      const isFirst = originalIndex === 0
                      const isLast = originalIndex === questions.length - 1

                      return (
                        <div
                          key={`${question.timestamp}-${paginatedIndex}`}
                          className="p-4 border border-gray-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800"
                        >
                          {isEditing ? (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Question:
                                </label>
                                <input
                                  type="text"
                                  value={editForm.question}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, question: e.target.value })
                                  }
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Answer:
                                </label>
                                <textarea
                                  value={editForm.answer}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, answer: e.target.value })
                                  }
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                  rows={4}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleSaveEdit} size="sm">
                                  <Save className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  onClick={handleCancelEdit}
                                  variant="outline"
                                  size="sm"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleDelete(originalIndex)}
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
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    {formatDate(question.updatedAt || question.timestamp)}
                                  </div>
                                  <div className="font-medium text-gray-900 dark:text-white mb-2">
                                    {question.question}
                                  </div>
                                  <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-stone-900/50 p-3 rounded border border-gray-200 dark:border-stone-700">
                                    {question.answer}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 ml-4">
                                  <div className="flex flex-col">
                                    <button
                                      onClick={() => handleMoveQuestion(originalIndex, 'up')}
                                      disabled={isFirst}
                                      className="p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleMoveQuestion(originalIndex, 'down')}
                                      disabled={isLast}
                                      className="p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <Button
                                    onClick={() => handleStartEdit(originalIndex)}
                                    variant="ghost"
                                    size="sm"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                          </div>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

