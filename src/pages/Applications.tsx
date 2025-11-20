import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'

interface Application {
  company: string
  jobTitle: string
  postedTime: string
  applicationTime: string
  link?: string
}

type LinkFilter = 'all' | 'with-link' | 'no-link'
type SortOrder = 'newest-first' | 'oldest-first'

const ITEMS_PER_PAGE = 20

export default function Applications() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [linkFilter, setLinkFilter] = useState<LinkFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest-first')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/applied')
        const data = await response.json()
        setApplications(data)
      } catch (error) {
        console.error('Failed to load applications:', error)
        setApplications([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [])

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let filtered = [...applications]

    // Apply link filter
    if (linkFilter === 'with-link') {
      filtered = filtered.filter(app => app.link && app.link.trim() !== '')
    } else if (linkFilter === 'no-link') {
      filtered = filtered.filter(app => !app.link || app.link.trim() === '')
    }

    // Apply sort
    filtered.sort((a, b) => {
      const timeA = new Date(a.applicationTime).getTime()
      const timeB = new Date(b.applicationTime).getTime()
      return sortOrder === 'newest-first' ? timeB - timeA : timeA - timeB
    })

    return filtered
  }, [applications, linkFilter, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedApplications.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedApplications = filteredAndSortedApplications.slice(startIndex, endIndex)

  // Reset to page 1 when filter or sort changes
  useEffect(() => {
    setCurrentPage(1)
  }, [linkFilter, sortOrder])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatPostedTime = (postedTime: string) => {
    // Parse postedTime (e.g., "10 hours ago", "2 days ago", "38 hours ago")
    const hoursMatch = postedTime.match(/(\d+)\s*hours?\s*ago/i)
    const daysMatch = postedTime.match(/(\d+)\s*days?\s*ago/i)
    
    if (hoursMatch) {
      const hours = parseInt(hoursMatch[1])
      if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`
      } else {
        const days = Math.floor(hours / 24)
        return `${days} day${days !== 1 ? 's' : ''} ago`
      }
    } else if (daysMatch) {
      const days = parseInt(daysMatch[1])
      return `${days} day${days !== 1 ? 's' : ''} ago`
    }
    
    // Fallback to original postedTime if we can't parse it
    return postedTime
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Applications
          </h2>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {isLoading ? (
            'Loading...'
          ) : (
            `Total: ${filteredAndSortedApplications.length} of ${applications.length} applications`
          )}
        </div>
      </div>

      <Card className="border-gray-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50/50 to-white dark:from-stone-900/50 dark:to-stone-800/50 border-b border-gray-200 dark:border-stone-700">
          <div className="flex flex-col gap-4">
            {/* <div>
              <CardTitle className="text-xl font-semibold">All Applications</CardTitle>
              <CardDescription className="mt-1">
                Complete list of all your job applications
              </CardDescription>
            </div> */}
            {/* Filters and Sort */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Link Filter */}
              <div className="flex items-center gap-2">
                <label htmlFor="link-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Link:
                </label>
                <select
                  id="link-filter"
                  value={linkFilter}
                  onChange={(e) => setLinkFilter(e.target.value as LinkFilter)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="with-link">With Link</option>
                  <option value="no-link">No Link</option>
                </select>
              </div>
              {/* Sort Order */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-order" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort:
                </label>
                <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="newest-first">Newest First</option>
                  <option value="oldest-first">Oldest First</option>
                </select>
              </div>
              {/* Results count */}
              <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedApplications.length)} of {filteredAndSortedApplications.length}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading applications...
            </div>
          ) : filteredAndSortedApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No applications found
            </div>
          ) : (
            <>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-stone-700">
                      <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-300">Company</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-300">Position</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-300">Posted</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-300">Applied</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                      <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedApplications.map((app, index) => (
                      <TableRow key={startIndex + index} className="border-gray-100 dark:border-stone-800 hover:bg-gray-50 dark:hover:bg-stone-800/50 transition-colors">
                        <TableCell className="font-medium capitalize text-sm">
                          {app.company}
                        </TableCell>
                        <TableCell className="text-sm truncate max-w-[200px]" title={app.jobTitle}>
                          {app.jobTitle}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {formatPostedTime(app.postedTime)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(app.applicationTime)}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium px-2.5 py-1 text-xs">
                            Applied
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {app.link ? (
                            <a
                              href={app.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors text-sm font-medium"
                            >
                              <span>View</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}

