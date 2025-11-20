import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Config from './pages/Config'
import Scheduler from './pages/Scheduler'
import Settings from './pages/Settings'
import Applications from './pages/Applications'
import KnowledgeBase from './pages/KnowledgeBase'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/config" element={<Config />} />
        <Route path="/scheduler" element={<Scheduler />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/unknown-questions" element={<KnowledgeBase />} />
      </Routes>
    </Layout>
  )
}

export default App
