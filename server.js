import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3010

// Get paths to JSON files (in data directory)
const knowledgeJsonPath = path.join(__dirname, 'data', 'knowledge.json')
const appliedJsonPath = path.join(__dirname, 'data', 'applied.json')
const dataDir = path.join(__dirname, 'data')

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dataDir)
  },
  filename: (req, file, cb) => {
    // Keep original filename, but ensure it's a PDF
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    cb(null, `${name}${ext}`)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  }
})

app.use(cors())
app.use(express.json())

// Read knowledge.json
app.get('/api/unknown', (req, res) => {
  try {
    if (!fs.existsSync(knowledgeJsonPath)) {
      return res.json([])
    }
    const data = fs.readFileSync(knowledgeJsonPath, 'utf-8')
    const json = data.trim() ? JSON.parse(data) : []
    res.json(Array.isArray(json) ? json : [])
  } catch (error) {
    console.error('Error reading knowledge.json:', error)
    res.status(500).json({ error: 'Failed to read knowledge.json' })
  }
})

// Update knowledge.json
app.post('/api/unknown', (req, res) => {
  try {
    const questions = req.body
    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: 'Invalid data format' })
    }
    fs.writeFileSync(knowledgeJsonPath, JSON.stringify(questions, null, 2), 'utf-8')
    res.json({ success: true })
  } catch (error) {
    console.error('Error writing knowledge.json:', error)
    res.status(500).json({ error: 'Failed to write knowledge.json' })
  }
})

// Update single question
app.put('/api/unknown/:index', (req, res) => {
  try {
    const index = parseInt(req.params.index)
    const updatedQuestion = req.body
    
    if (!fs.existsSync(knowledgeJsonPath)) {
      return res.status(404).json({ error: 'knowledge.json not found' })
    }
    
    const data = fs.readFileSync(knowledgeJsonPath, 'utf-8')
    const questions = data.trim() ? JSON.parse(data) : []
    
    if (!Array.isArray(questions) || index < 0 || index >= questions.length) {
      return res.status(400).json({ error: 'Invalid index' })
    }
    
    questions[index] = updatedQuestion
    fs.writeFileSync(knowledgeJsonPath, JSON.stringify(questions, null, 2), 'utf-8')
    res.json({ success: true, question: updatedQuestion })
  } catch (error) {
    console.error('Error updating question:', error)
    res.status(500).json({ error: 'Failed to update question' })
  }
})

// Read applied.json
app.get('/api/applied', (req, res) => {
  try {
    if (!fs.existsSync(appliedJsonPath)) {
      return res.json([])
    }
    const data = fs.readFileSync(appliedJsonPath, 'utf-8')
    const json = data.trim() ? JSON.parse(data) : []
    res.json(Array.isArray(json) ? json : [])
  } catch (error) {
    console.error('Error reading applied.json:', error)
    res.status(500).json({ error: 'Failed to read applied.json' })
  }
})

// Update applied.json
app.post('/api/applied', (req, res) => {
  try {
    const applications = req.body
    if (!Array.isArray(applications)) {
      return res.status(400).json({ error: 'Invalid data format' })
    }
    fs.writeFileSync(appliedJsonPath, JSON.stringify(applications, null, 2), 'utf-8')
    res.json({ success: true })
  } catch (error) {
    console.error('Error writing applied.json:', error)
    res.status(500).json({ error: 'Failed to write applied.json' })
  }
})

// Get list of resume files
app.get('/api/resumes', (req, res) => {
  try {
    const files = fs.readdirSync(dataDir)
    const resumeFiles = files
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => {
        const filePath = path.join(dataDir, file)
        const stats = fs.statSync(filePath)
        return {
          name: file,
          type: 'application/pdf',
          size: stats.size,
          uploadedAt: stats.mtime.toISOString()
        }
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    
    res.json(resumeFiles)
  } catch (error) {
    console.error('Error reading resume files:', error)
    res.status(500).json({ error: 'Failed to read resume files' })
  }
})

// Upload resume file
app.post('/api/resumes/upload', (req, res) => {
  console.log('Upload request received')
  upload.single('resume')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err)
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' })
        }
        return res.status(400).json({ error: err.message || 'Upload error' })
      }
      return res.status(400).json({ error: err.message || 'Upload failed' })
    }
    
    try {
      if (!req.file) {
        console.log('No file in request')
        return res.status(400).json({ error: 'No file uploaded. Please select a PDF file.' })
      }
      
      console.log('File uploaded successfully:', req.file.filename)
      res.json({
        success: true,
        file: {
          name: req.file.filename,
          size: req.file.size,
          uploadedAt: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error processing upload:', error)
      res.status(500).json({ error: error.message || 'Failed to upload resume' })
    }
  })
})

// Delete resume file
app.delete('/api/resumes/:filename', (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename)
    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' })
    }
    
    const filePath = path.join(dataDir, filename)
    
    // Only allow deleting PDF files
    if (!filename.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'Only PDF files can be deleted' })
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' })
    }
    
    fs.unlinkSync(filePath)
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting resume:', error)
    res.status(500).json({ error: 'Failed to delete resume' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

