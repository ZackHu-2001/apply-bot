# LinkedIn Auto Apply Task

## Task Description

Open LinkedIn, search for software engineer positions posted within the last 24 hours, and help me apply to the latest 20 job postings.

## Personal Information Sources

My personal information is stored in the `data/` folder:
- **`resume.txt`** - Complete resume text (personal info, work experience, education, skills)
- **`knowledge.json`** - Pre-answered application questions (work authorization, demographics, availability)
- **`job-filters.json`** - Job filtering preferences (blacklist/whitelist, salary, work type, tech stack)
- **`resume-meta.json`** - Resume metadata (source file, parse date)

## Operation Requirements

1. **Verbose Mode - Explain Every Step**: For each action you take, provide a brief explanation of:
   - What you are about to do
   - Why you are doing it (the reasoning/basis)
   - What information or rule you are following
   - Example: "Filling 'Yes' for work authorization field because knowledge.json shows no sponsorship required"
   - Example: "Skipping this job because company 'XYZ' is in the job-filters.json blacklist"
   - Example: "Selecting 'Male' for gender because knowledge.json has this answer recorded"
   - Example: "Filling email as 'john@example.com' from resume.txt"

2. **Minimize Operations**: Minimize the number of snapshot calls. When you see all input fields, fill them all out at once based on my information to reduce the total number of operations.

2. **Information Processing**:
   - Prioritize reading information from `data/resume.txt` for personal/resume information
   - Use `data/knowledge.json` for pre-answered questions and form field mappings
   - If you encounter uncertain or missing information, make reasonable assumptions based on context first
   - **CRITICAL: Every time you fill in an assumed answer, you MUST immediately record it to `data/knowledge.json`**
   - Record format:
     ```json
     {
       "question": "Original question text",
       "assumedAnswer": "The assumed answer",
       "reasoning": "Why you made this assumption (optional)",
       "timestamp": "timestamp"
     }
     ```
   - **Examples of when to record**:
     - "How many years of Selenium experience?" → Record if not in resume.txt or knowledge.json
     - "Years of JSON experience?" → Record if not in resume.txt or knowledge.json
     - Any technology-specific years of experience questions
     - Any question where you estimate or infer the answer

3. **Application Records**:
   - After completing each application, **immediately** record the job posting information to `data/applied.json`
   - Record format:
     ```json
     {
       "company": "Company name",
       "jobTitle": "Job title",
       "postedTime": "Job posting time (ISO 8601 timestamp, calculated from relative time)",
       "applicationTime": "Application time (ISO 8601 format, precise to hour, minute, second, e.g., 2025-11-17T00:16:12Z)",
       "status": "applied" or "needs-human-review",
       "link": "Job posting link (try to preserve, even for Easy Apply)"
     }
     ```
   - **Important**: `applicationTime` must use the **actual timestamp** when the application is completed. Use `date -u +"%Y-%m-%dT%H:%M:%SZ"` to get the current UTC time. Do not use fixed timestamps or placeholders.
   - **Important**: `postedTime` must be calculated from the relative time displayed on LinkedIn (e.g., "7 hours ago", "2 days ago"). Calculate the actual timestamp by subtracting the duration from the current time. Use ISO 8601 format (e.g., 2025-11-17T00:16:12Z). This ensures the time is accurate and can be properly sorted.
   - **Important**: Try to preserve the `link` field, even for Easy Apply, record the job posting link for future reference and tracking.
   - **Status Description**:
     - `status: "applied"` - Successfully completed application (default status, if not specified, default to this status)
     - `status: "needs-human-review"` - Requires human intervention (e.g., form too complex, requires additional information, captcha, cannot be completed automatically, etc.), **must provide the `link` field** for manual follow-up processing

4. **Form Filling**:
   - Check `data/knowledge.json` for previously answered questions and field mappings
   - Extract information from `data/resume.txt` for personal details, work experience, skills, etc.
   - Use `data/job-filters.json` for job preferences and filtering criteria
   - For questions that cannot be determined, make reasonable assumptions and record to `data/knowledge.json`
   
   **Important - LinkedIn Form Element Special Handling**:
   - LinkedIn's radio/checkbox buttons' `value` attributes are usually UUIDs, not visible text (like "Yes"/"No")
   - If you cannot select radio/checkbox through `browser_click` or CSS selectors, use the following method:
     1. Use `browser_evaluate` to check the actual DOM structure and find the element's real ID
     2. Get the element directly through `getElementById`
     3. Execute: `element.click()` → `element.checked = true` → Manually trigger events:
        ```javascript
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('click', { bubbles: true }));
        ```
   - For text input fields, prioritize using the `browser_type` tool
   - For dropdowns, use the `browser_select_option` tool
   - If form validation fails, check if all required fields are correctly filled, especially whether radio/checkbox are actually selected

5. **Modal Close Optimization**:
   - **Problem**: When using `browser_click` to click close buttons (like "Done", "Dismiss"), although the modal is closed, the tool may still be waiting for the page to fully load or async operations to complete, causing slow response
   - **Reason**: LinkedIn may perform the following operations when closing modals:
     - Send analytics data to the server
     - Update page state
     - Trigger multiple event listeners
     - Wait for network requests to complete
   - **Solution**: Prioritize using the following fast close methods:
     1. **Press ESC key** (fastest): Use the `browser_press_key` tool to press the `Escape` key
     2. **Directly trigger ESC event**: Use `browser_evaluate` to execute:
        ```javascript
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        ```
     3. **Click background overlay**: If the modal has a close-on-background-click feature, click the background directly
   - **Note**: If you just need to close the modal and continue to the next operation, you don't need to wait for `browser_click` to complete. You can directly use `browser_evaluate` or `browser_press_key` to close quickly

6. **Other Tips**:
   - It's recommended to disable the Simplify extension first (if enabled)
   - Prioritize applying to positions with the "Easy Apply" label
   - If the form is too complex or cannot be completed, skip and record the reason

7. **Session Logging**:
   - At the START of each application session, create a log file at `data/logs.json`
   - Create a new session with format:
     ```json
     {
       "id": "session-{timestamp}",
       "name": "LinkedIn Auto Apply - {date}",
       "createdAt": "ISO timestamp",
       "entries": []
     }
     ```
   - For each significant action, append a log entry:
     ```json
     {
       "timestamp": "ISO timestamp",
       "action": "Brief action description",
       "reason": "Why this action was taken (the verbose explanation)",
       "result": "Outcome of the action (optional)",
       "type": "info|success|warning|error"
     }
     ```
   - **Log these events**:
     - Starting application for a job (type: info)
     - Filling each form field with reasoning (type: info)
     - Skipping a job and why (type: warning)
     - Successfully submitting application (type: success)
     - Errors or issues encountered (type: error)
     - Using assumed answers (type: warning)
   - At the END of the session, update the session with a summary:
     ```json
     {
       "summary": {
         "totalApplications": number,
         "successful": number,
         "needsReview": number,
         "skipped": number
       }
     }
     ```

## File Structure

```
apply-bot/
├── data/
│   ├── resume.txt (parsed resume text)
│   ├── resume-meta.json (resume metadata)
│   ├── applied.json (application records)
│   ├── knowledge.json (pre-answered questions)
│   ├── job-filters.json (job filtering preferences)
│   └── logs.json (session logs)
└── readme.md (this file)
```