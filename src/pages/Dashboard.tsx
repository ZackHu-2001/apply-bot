import { useState, useEffect } from 'react'
import { usePlaywrightConnection } from '../hooks/usePlaywrightConnection'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { TrendingUp, FileText, CheckCircle2, RefreshCw, Download, ExternalLink, Github, Heart, BookOpen, ArrowUpRight, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Application {
  company: string
  jobTitle: string
  postedTime: string
  applicationTime: string
  link?: string
}

// Helper function to generate daily application data from applications
const generateDailyData = (applications: Application[]) => {
  const dailyCounts: { [key: string]: number } = {}
  
  applications.forEach(app => {
    const date = new Date(app.applicationTime)
    const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1
  })
  
  // Get last 30 days
  const last30Days: { date: string; applied: number }[] = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    last30Days.push({
      date: dateKey,
      applied: dailyCounts[dateKey] || 0
    })
  }
  
  return last30Days
}

const chartConfig = {
  applied: {
    label: 'Applied',
    color: 'hsl(25, 20%, 45%)', // stone-600 color
  },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { status } = usePlaywrightConnection()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dailyApplicationsData, setDailyApplicationsData] = useState<{ date: string; applied: number }[]>([])

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/applied')
        const data = await response.json()
        // Sort by applicationTime descending (most recent first)
        const sorted = data.sort((a: Application, b: Application) => 
          new Date(b.applicationTime).getTime() - new Date(a.applicationTime).getTime()
        )
        setApplications(sorted)
        // Generate daily data for chart
        setDailyApplicationsData(generateDailyData(sorted))
      } catch (error) {
        console.error('Failed to load applications:', error)
        setApplications([])
        setDailyApplicationsData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [])

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

  // Calculate additional stats for Total Applications card
  const getApplicationStats = () => {
    if (applications.length === 0) return null

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const todayCount = applications.filter(app => 
      new Date(app.applicationTime) >= today
    ).length

    const last7DaysCount = applications.filter(app => 
      new Date(app.applicationTime) >= last7Days
    ).length

    const last30DaysCount = applications.filter(app => 
      new Date(app.applicationTime) >= last30Days
    ).length

    return {
      last7Days: last7DaysCount,
      last30Days: last30DaysCount,
      today: todayCount,
    }
  }

  const appStats = getApplicationStats()

  // Calculate month-over-month growth
  const getMonthGrowth = () => {
    if (applications.length === 0) return null

    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

    const currentMonthCount = applications.filter(app => {
      const appDate = new Date(app.applicationTime)
      return appDate >= currentMonthStart && appDate <= currentMonthEnd
    }).length

    const lastMonthCount = applications.filter(app => {
      const appDate = new Date(app.applicationTime)
      return appDate >= lastMonthStart && appDate <= lastMonthEnd
    }).length

    // If no data for last month, don't show the indicator
    if (lastMonthCount === 0) return null

    const growth = ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100
    return {
      percentage: growth,
      isPositive: growth >= 0,
    }
  }

  const monthGrowth = getMonthGrowth()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h2>
          <div className="group relative">
            <Info className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 cursor-help" />
            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 dark:bg-stone-800 text-white dark:text-gray-100 text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
              All data is stored locally in the <code className="bg-gray-800 dark:bg-stone-900 px-1 rounded">data/</code> folder
            </div>
          </div>
        </div>

        {/* Open Source Links */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/ZackHu-2001/apply-bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-stone-800 hover:bg-gray-200 dark:hover:bg-stone-700 text-gray-700 dark:text-gray-300 transition-colors text-sm font-medium"
            title="View on GitHub"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a
            href="https://docs.apply-bot.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-stone-800 hover:bg-gray-200 dark:hover:bg-stone-700 text-gray-700 dark:text-gray-300 transition-colors text-sm font-medium"
            title="Documentation"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Docs</span>
          </a>
          <a
            href="https://github.com/sponsors/ZackHu-2001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 text-pink-700 dark:text-pink-300 transition-colors text-sm font-medium border border-pink-200 dark:border-pink-800"
            title="Support this project"
          >
            <Heart className="h-4 w-4 fill-pink-600 dark:fill-pink-400" />
            <span className="hidden sm:inline">Sponsor</span>
          </a>
        </div>
      </div>

      {/* Chart and Stats Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Daily Applications Chart - 3/4 width */}
        <div className="lg:col-span-3">
          <Card className="border-gray-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-shadow duration-200 h-full overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50/50 to-white dark:from-stone-900/50 dark:to-stone-800/50 border-b border-gray-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Daily Applications</CardTitle>
              <CardDescription className="mt-1">
                Showing total applications for the last 30 days
              </CardDescription>
            </div>
            {monthGrowth && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                monthGrowth.isPositive
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <TrendingUp className={`h-4 w-4 ${
                  monthGrowth.isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400 rotate-180'
                }`} />
                <span className={`text-sm font-medium ${
                  monthGrowth.isPositive
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {monthGrowth.isPositive ? '+' : ''}{monthGrowth.percentage.toFixed(1)}% this month
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart
              data={dailyApplicationsData}
              margin={{
                left: 0,
                right: 12,
                top: 12,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="fillApplied" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-applied)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-applied)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-stone-700" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
                className="text-xs text-gray-600 dark:text-gray-400"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="applied"
                type="natural"
                fill="url(#fillApplied)"
                fillOpacity={1}
                stroke="var(--color-applied)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
          </Card>
        </div>

        {/* Right Side Stats - 1/4 width */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Total Applications */}
          <Card className="border-gray-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-gray-50/50 dark:from-stone-800 dark:to-stone-900/50 flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Total Applications
              </CardTitle>
              <div className="h-10 w-10 text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-700/50 rounded-lg p-2 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {isLoading ? '...' : applications.length.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  {applications.length > 0 ? 'Active applications' : 'No applications yet'}
                </p>
              </div>
              {appStats && applications.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-stone-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Today</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{appStats.today}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Last 7 days</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{appStats.last7Days}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Last 30 days</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{appStats.last30Days}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extension Status */}
          <Card className={`border-gray-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-shadow duration-200 flex-1 flex flex-col ${
            status.extensionInstalled 
              ? 'bg-gradient-to-br from-green-50/50 to-white dark:from-green-900/10 dark:to-stone-800/50'
              : 'bg-gradient-to-br from-red-50/50 to-white dark:from-red-900/10 dark:to-stone-800/50'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              {status.extensionInstalled ? (
                <>
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Extension Status
                  </CardTitle>
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Extension Status
                  </CardTitle>
                  <div className="flex-1" />
                  <button
                    onClick={() => window.location.reload()}
                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-stone-700/50 rounded-lg transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              {status.extensionInstalled ? (
                <>
                  <div>
                    <div className="text-3xl font-bold text-green-700 dark:text-green-400 mb-1">
                      Active
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Extension is ready and working
                    </p>
                  </div>
               <a
                 href="https://docs.apply-bot.com/"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-700 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow"
               >
                 <ExternalLink className="h-4 w-4" />
                 <span>View Docs</span>
               </a>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Not Detected
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Extension not detected
                    </p>
                  </div>
                  <a
                    href="https://github.com/ZackHu-2001/apply-bot-mcp-extension/releases/latest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-700 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Extension</span>
                  </a>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dashboard Data Table */}
      <Card className="mb-8 border-gray-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50/50 to-white dark:from-stone-900/50 dark:to-stone-800/50 border-b border-gray-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Recent Applications</CardTitle>
              <CardDescription className="mt-1">
                A list of your recent job applications and their status.
              </CardDescription>
            </div>
            <button
              onClick={() => navigate('/applications')}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-stone-700 transition-colors"
              aria-label="View all applications"
              title="View all applications"
            >
              <ArrowUpRight className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No applications found
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-stone-700">
                    <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-300">Company</TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-300">Position</TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-300">Applied</TableHead>
                    <TableHead className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.slice(0, 10).map((app, index) => (
                    <TableRow key={index} className="border-gray-100 dark:border-stone-800 hover:bg-gray-50 dark:hover:bg-stone-800/50 transition-colors">
                      <TableCell className="font-medium capitalize text-sm">
                        {app.company}
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-[200px]" title={app.jobTitle}>
                        {app.jobTitle}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium px-2.5 py-1 text-xs">
                          Applied
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(app.applicationTime)}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
