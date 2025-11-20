# Unknown Questions Module Setup

## Overview

This module is used to manage and display unknown questions that AI encounters during the application process. When AI encounters questions it cannot determine the answer to, they are recorded in the `data/knowledge.json` file, and you can view, answer, and edit these questions in this module.

## Quick Start

### 1. Install Dependencies

```bash
cd portal
npm install
```

### 2. Start Both Frontend and Backend (One Command)

Run this single command to start both servers:

```bash
npm start
```

This will start:
- Backend server on `http://localhost:3010`
- Frontend dev server on `http://localhost:5173` (or the port Vite assigns)

## Alternative: Start Separately

If you prefer to start them separately:

### Start Backend Server

In one terminal window:

```bash
npm run server
```

### Start Frontend Dev Server

In another terminal window:

```bash
npm run dev
```

## Usage

1. **View Unknown Questions**:
   - Click "Unknown Questions" in the sidebar to navigate to the page
   - The page will display all questions recorded by AI

2. **Answer Unanswered Questions**:
   - In the "Unanswered Questions" section, find the question you want to answer
   - Enter your answer in the text box
   - Click the "Save" button to save the answer

3. **Edit Answered Questions**:
   - In the "Answered Questions" section, find the question you want to edit
   - Click the edit icon on the right side of the question
   - Modify the question or answer
   - Click "Save" to save changes, or "Cancel" to discard changes

## Data Format

The `data/knowledge.json` file format:

```json
[
  {
    "question": "Question content",
    "assumedAnswer": "AI's assumed answer (optional)",
    "answer": "User-provided answer (optional)",
    "timestamp": "2025-01-20T10:30:00.000Z"
  }
]
```

## API Endpoints

- `GET /api/unknown` - Get all questions
- `POST /api/unknown` - Update the entire question list
- `PUT /api/unknown/:index` - Update a single question (not currently used)

## Notes

- Make sure the backend server is running, otherwise the frontend cannot load or save data
- The `knowledge.json` file is located in the `data/` directory
- If the file doesn't exist, the server will automatically create an empty array

