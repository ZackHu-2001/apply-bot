import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Edit2, Save, X, Plus, Info } from 'lucide-react'

interface KnowledgeEntry {
  question: string
  assumedAnswer?: string
  answer?: string
  timestamp: string
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
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        answer: answer,
        timestamp: updatedQuestions[index].timestamp || new Date().toISOString()
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
      updatedQuestions[editingIndex] = {
        ...updatedQuestions[editingIndex],
        question: editForm.question,
        answer: editForm.answer,
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
        throw new Error('Failed to create new knowledge')
      }
    } catch (error) {
      console.error('Failed to create new knowledge:', error)
      alert('Failed to create new knowledge. Please try again.')
    }
  }

  const handleCancelNew = () => {
    setIsCreatingNew(false)
    setNewKnowledge({ question: '', answer: '' })
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
            Knowledge Base
          </h2>
          <div className="group relative">
            <Info className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 cursor-help" />
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 dark:bg-stone-800 text-white dark:text-gray-100 text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
              All data is stored locally in the <code className="bg-gray-800 dark:bg-stone-900 px-1 rounded">data/</code> folder
            </div>
          </div>
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
                Knowledge
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
              New Knowledge
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
                          <div className="mb-3">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              {formatDate(question.timestamp)}
                            </div>
                            <div className="font-medium text-gray-900 dark:text-white mb-2">
                              {question.question}
                            </div>
                            {question.assumedAnswer && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                                Assumed Answer: {question.assumedAnswer}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <textarea
                              value={newAnswer[originalIndex] || ''}
                              onChange={(e) =>
                                setNewAnswer({ ...newAnswer, [originalIndex]: e.target.value })
                              }
                              placeholder="Enter your answer..."
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                              rows={3}
                            />
                            <Button
                              onClick={() => handleSaveAnswer(originalIndex)}
                              size="sm"
                              className="self-start"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
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
                <CardTitle className="text-xl font-semibold">Knowledge Base</CardTitle>
                <CardDescription>
                  Your knowledge base of questions and answers. Click the edit button to modify them.
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
                      <p className="text-lg mb-2">No knowledge entries yet</p>
                      <p className="text-sm mb-4">Click "New Knowledge" to create your first entry</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {answeredQuestions.map((question, index) => {
                      // Find original index using timestamp and question combination
                      const originalIndex = questions.findIndex(
                        q => q.timestamp === question.timestamp && q.question === question.question
                      )
                      const isEditing = editingIndex === originalIndex

                      return (
                        <div
                          key={`${question.timestamp}-${index}`}
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
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    {formatDate(question.timestamp)}
                                  </div>
                                  <div className="font-medium text-gray-900 dark:text-white mb-2">
                                    {question.question}
                                  </div>
                                  <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-stone-900/50 p-3 rounded border border-gray-200 dark:border-stone-700">
                                    {question.answer}
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handleStartEdit(originalIndex)}
                                  variant="ghost"
                                  size="sm"
                                  className="ml-4"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

