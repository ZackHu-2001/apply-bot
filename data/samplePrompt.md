# LinkedIn Auto Apply Task

## Task Description

Open LinkedIn, search for software engineer positions posted within the last 24 hours, and help me apply to the latest 20 job postings.

## Personal Information Sources

My personal information is stored in the `data/` folder:
- `SampleResume.tex` / `SampleResume.pdf` - Resume information
- `config.json` - Configuration file (contains personal information, application form answers, etc.)

The configuration file is located at `data/config.json` and contains:
- Personal information (name, email, phone, etc.)
- Work authorization information (work permit/visa requirements)
- Demographics information (ethnicity, veteran status, etc.)
- Availability information (start date, relocation willingness, etc.)
- Experience information (years of experience, relevant experience, etc.)
- Application form answer mappings

## Operation Requirements

1. **Minimize Operations**: Minimize the number of snapshot calls. When you see all input fields, fill them all out at once based on my information to reduce the total number of operations.

2. **Information Processing**:
   - Prioritize reading information from the `data/` folder and `data/config.json`
   - If you encounter uncertain or missing information, make reasonable assumptions based on context first
   - Record all assumptions and uncertain information to the `data/knowledge.json` file in the format: `{"question": "question content", "assumedAnswer": "assumed answer", "timestamp": "timestamp"}`

3. **Application Records**:
   - After completing each application, **immediately** record the job posting information to `data/applied.json`
   - Record format:
     ```json
     {
       "company": "Company name",
       "jobTitle": "Job title",
       "postedTime": "Posted time (e.g., 19 hours ago)",
       "applicationTime": "Application time (ISO 8601 format, precise to hour, minute, second, e.g., 2025-11-17T00:16:12Z)",
       "status": "applied" or "needs-human-review",
       "link": "Job posting link (try to preserve, even for Easy Apply)"
     }
     ```
   - **Important**: `applicationTime` must use the **actual timestamp** when the application is completed. Use `date -u +"%Y-%m-%dT%H:%M:%SZ"` to get the current UTC time. Do not use fixed timestamps or placeholders.
   - **Important**: Try to preserve the `link` field, even for Easy Apply, record the job posting link for future reference and tracking.
   - **Status Description**:
     - `status: "applied"` - Successfully completed application (default status, if not specified, default to this status)
     - `status: "needs-human-review"` - Requires human intervention (e.g., form too complex, requires additional information, captcha, cannot be completed automatically, etc.), **must provide the `link` field** for manual follow-up processing

4. **Form Filling**:
   - Read `applicationFormAnswers.fieldMappings` from `data/config.json` to match form questions
   - Use values from `applicationFormAnswers.commonQuestions` to fill in
   - If questions don't match, refer to fields like `personalInfo`, `workAuthorization`, `demographics`, `availability`, `experience`, etc.
   - For questions that cannot be determined, fill them in and record to `data/knowledge.json`
   
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

## File Structure

```
apply-bot/
├── data/
│   ├── SampleResume.pdf
│   ├── SampleResume.tex
│   └── config.json (main configuration file)
├── data/
│   ├── applied.json (application records)
│   └── knowledge.json (uncertain information records)
└── readme.md (this file)
```
