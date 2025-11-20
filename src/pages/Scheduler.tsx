import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Clock, Calendar, Play, Pause, Trash2 } from 'lucide-react'

interface ScheduledTask {
  id: string
  name: string
  type: 'auto-apply' | 'auto-scan' | 'reminder'
  schedule: string
  status: 'active' | 'paused'
  nextRun: string
  lastRun?: string
}

export default function Scheduler() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([
    {
      id: '1',
      name: 'Daily Job Scan',
      type: 'auto-scan',
      schedule: 'Every day at 9:00 AM',
      status: 'active',
      nextRun: '2024-01-16 09:00',
      lastRun: '2024-01-15 09:00',
    },
    {
      id: '2',
      name: 'Weekly Application Review',
      type: 'reminder',
      schedule: 'Every Monday at 10:00 AM',
      status: 'active',
      nextRun: '2024-01-22 10:00',
      lastRun: '2024-01-15 10:00',
    },
    {
      id: '3',
      name: 'Auto Apply High Match Jobs',
      type: 'auto-apply',
      schedule: 'Every 6 hours',
      status: 'paused',
      nextRun: '2024-01-16 12:00',
      lastRun: '2024-01-15 18:00',
    },
  ])

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id
        ? { ...task, status: task.status === 'active' ? 'paused' : 'active' }
        : task
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'auto-apply':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'auto-scan':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'reminder':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'auto-apply':
        return 'Auto Apply'
      case 'auto-scan':
        return 'Auto Scan'
      case 'reminder':
        return 'Reminder'
      default:
        return type
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Scheduler
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-stone-700 hover:bg-stone-800 text-white rounded-lg transition-colors">
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Tasks
            </CardTitle>
            <Play className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {tasks.filter(t => t.status === 'active').length}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Tasks
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {tasks.length}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Scheduled tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Next Run
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {tasks.filter(t => t.status === 'active').length > 0
                ? new Date(tasks.filter(t => t.status === 'active').sort((a, b) => 
                    new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime()
                  )[0].nextRun).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'N/A'}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Earliest scheduled task
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Tasks</CardTitle>
          <CardDescription>
            Manage your automated tasks and reminders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(task.type)}`}>
                      {getTypeLabel(task.type)}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {task.schedule}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                    }`}>
                      {task.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {new Date(task.nextRun).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {task.lastRun
                      ? new Date(task.lastRun).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-stone-700 transition-colors"
                        title={task.status === 'active' ? 'Pause' : 'Resume'}
                      >
                        {task.status === 'active' ? (
                          <Pause size={16} className="text-gray-600 dark:text-gray-400" />
                        ) : (
                          <Play size={16} className="text-gray-600 dark:text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

