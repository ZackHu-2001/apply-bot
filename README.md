# AI Resume Applier 🤖

> Your intelligent job application assistant - Just tell it what you want, it handles the rest

Simply tell your apply-bot what kind of jobs you want to apply for, and it executes:
- *"Apply to Software Engineer positions in Vancouver posted in last 24 hours on LinkedIn"*
- *"Apply to Software Engineer jobs requiring Java on Indeed"*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

[🎥 Video Demo](#) | [📖 Documentation](docs/setup.md) | [💬 Issues](https://github.com/yourusername/ai-resume-applier/issues)

---

## ✨ Key Features

- 🤖 **Natural Language Control** - Just describe what you want in plain English
- 🌐 **Uses Your Real Browser** - Works with your actual browser session and cookies
- 🔐 **Privacy-First** - All data stored locally, no cloud sync required
- 🎯 **Company Whitelist** - Apply only to your preferred companies
- 📊 **One-Click Application History** - Track all your applications easily
- ⏰ **Scheduled Applications** - Set it and forget it with custom schedules
- 🔒 **Real Browser Fingerprint** - Safer than automation - uses genuine browser identity
- 🧠 **Multi-LLM Support** - Works with Claude, Cursor, VSCode, Windsurf, or any MCP-compatible AI

## 🎯 How It Works

Simply chat with your AI assistant in natural language:

```
You: "Apply to Software Engineer positions in Vancouver posted in last 24 hours on LinkedIn"

Bot: "Got it! I'll search LinkedIn for Software Engineer jobs in Vancouver from the last 24 hours 
and start applying. Would you like me to filter by company size or experience level?"
```

```
You: "Apply to Java developer jobs on Indeed, but only for companies: Google, Amazon, Microsoft"

Bot: "Perfect! I'll apply to Java developer positions on Indeed, filtering for your whitelist 
companies: Google, Amazon, and Microsoft. Starting now..."
```

## 🛠️ Tech Stack

- **Playwright MCP Server** - Browser automation control
- **Your Favorite AI** - Claude, Cursor, VSCode, Windsurf, or any MCP-compatible LLM
- **Playwright Browser Extension** - Connects to your real browser tabs

## 📋 Prerequisites

Before you begin, ensure you have:

- [ ] **An MCP-compatible AI tool** (choose one):
  - [Claude Desktop](https://claude.ai/download) - Anthropic's official app
  - [Cursor IDE](https://cursor.sh/) - AI-powered code editor
  - [VSCode](https://code.visualstudio.com/) with MCP extension
  - [Windsurf](https://codeium.com/windsurf) - AI coding assistant
  - Or any other MCP-compatible client
- [ ] Chrome/Edge browser
- [ ] Node.js 18+ environment
- [ ] Organized personal resume information (structured document recommended)

## 🚀 Quick Start

### Step 1: Install Playwright MCP Server

```bash
# Install globally with npm
npm install -g @modelcontextprotocol/server-playwright

# Or use npx (no global installation needed)
npx @modelcontextprotocol/server-playwright
```

### Step 2: Configure MCP in Your AI Tool

**For Claude Desktop:**
1. Open Claude settings
2. Navigate to "Developer" → "Model Context Protocol"
3. Add Playwright MCP Server configuration

**For Cursor/VSCode:**
1. Open settings (Cmd/Ctrl + ,)
2. Search for "MCP" or find "Model Context Protocol"
3. Add Playwright MCP Server configuration

**For Windsurf:**
1. Open Windsurf settings
2. Find MCP configuration section
3. Add Playwright MCP Server

**Configuration (works for all tools):**
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-playwright"
      ]
    }
  }
}
```

### Step 3: Install Playwright Browser Extension

1. Visit [Playwright Chrome Extension](https://chromewebstore.google.com/) (search for "Playwright")
2. Install the extension to Chrome/Edge browser
3. Enable "Allow access to all websites" in the extension settings

### Step 4: Prepare Resume Information

Create a `my-resume.md` file with structured information:

```markdown
# Resume Information

## Basic Information
- Name: John Doe
- Phone: +1-555-0123
- Email: john.doe@example.com
- Expected Salary: $80K-100K

## Work Experience
### Company A - Senior Frontend Engineer (Jun 2021 - Mar 2024)
- Led frontend architecture design for XX system
- Developed using React + TypeScript...

## Projects
### Project 1: E-commerce Platform
- Tech Stack: React, Redux, Ant Design
- Responsibilities: ...

## Skills
- Frontend: React, Vue, TypeScript, Webpack
- Backend: Node.js, Python
- Other: Git, Docker, CI/CD
```

### Step 5: Start Using

1. Open a job application page on a recruiting website
2. Activate the Playwright browser extension (click the extension icon)
3. Open your AI tool (Claude/Cursor/VSCode/Windsurf) with your resume file
4. Start chatting with your apply-bot in natural language!

**Example Commands:**
- "Find and apply to Software Engineer jobs in Vancouver posted today on LinkedIn"
- "Apply to Java developer positions on Indeed, only companies: Google, Amazon"
- "Show me all applications I've submitted this week"

## 💡 Prompt Templates

See detailed prompt templates at [prompts/example-prompts.md](prompts/example-prompts.md)

### Basic Workflow

```
1. Analyze Page
"Please connect to the current browser tab and analyze this job application form structure. List all fields that need to be filled and required fields."

2. Fill Basic Information
"Based on my resume information (my-resume.md), automatically fill in the basic information fields in the form: name, phone, email, expected salary, etc."

3. Handle Work Experience
"Fill in the work experience section, ensuring date formats match the form requirements. If there are character limits, automatically adjust description length."

4. Answer Open-ended Questions
"There's a question on the page: 'Why do you want to join us?' Please generate a sincere 150-word answer based on:
1. Job description (JD) content
2. Company introduction
3. My background and experience"

5. Upload Attachments
"Find the resume upload button and prepare to upload the file. Please tell me the location of the upload button."
(Note: File uploads require manual operation)

6. Final Check
"Before submitting, please check if all fields are filled completely and list items that need manual confirmation."
```

## 🚀 Core Features Deep Dive

### 🎯 Natural Language Job Search

Simply describe what you want:

```
"Apply to Software Engineer positions in Vancouver posted in last 24 hours on LinkedIn"
"Apply to Frontend Developer jobs requiring React on Indeed"
"Find ML Engineer positions at startups in San Francisco"
```

Your apply-bot understands:
- **Location filtering**: City, state, country, or remote
- **Time constraints**: Last 24 hours, this week, last month
- **Technology requirements**: Specific programming languages or frameworks
- **Job level**: Entry-level, mid-level, senior, lead
- **Company type**: Startups, Fortune 500, agencies

### 🏢 Company Whitelist/Blacklist

Control exactly where your resume goes:

```
"Apply to jobs but only for companies: Google, Amazon, Microsoft, Apple"
"Apply to all matching jobs except companies: Accenture, TCS"
```

Benefits:
- Target dream companies only
- Avoid recruiters or agencies
- Filter by company size or type
- Maintain quality over quantity

### 🌐 Real Browser Integration

Unlike traditional bots, this uses YOUR actual browser:

✅ **Advantages:**
- Uses your logged-in sessions (no repeated logins)
- Maintains your cookies and preferences
- Real browser fingerprint (not detectable as automation)
- Can handle complex authentication flows
- Works with platforms that block headless browsers

❌ **Traditional Automation Problems Solved:**
- No "bot detection" blocks
- No CAPTCHA issues from suspicious traffic
- No account bans from unusual activity
- Appears as genuine human usage

### 🔐 Privacy & Local Storage

**Everything stays on your machine:**
- Resume data stored locally
- Application history in local database
- No cloud sync or external servers
- You control your data completely

**What's stored:**
- Companies applied to
- Application dates and times
- Job descriptions (for reference)
- Custom answers you've used
- Success/rejection tracking

### 📊 Application Tracking

One-click access to your application history:

```
"Show me all applications from this week"
"How many jobs have I applied to at Google?"
"Which applications haven't received responses?"
```

**Track:**
- ✅ Successfully submitted applications
- ⏳ In-progress applications
- ❌ Failed/rejected applications
- 📧 Response status
- 📅 Follow-up reminders

### ⏰ Scheduled Applications

Set it and forget it:

```
"Apply to 5 Software Engineer jobs every morning at 9 AM"
"Every Monday, apply to new React developer positions"
"Apply to jobs matching my criteria once per day"
```

**Features:**
- Custom schedules (hourly, daily, weekly)
- Rate limiting (avoid spam flags)
- Automatic retries on failures
- Pause/resume anytime
- Email notifications on completion

## 🎯 Advanced Tips

### 1. Batch Processing Multiple Positions

```
"I'm applying to 5 similar frontend positions. Please help me:
1. Remember the form structure of the current page
2. Tell me if the next page has the same structure, we can reuse the filling logic"
```

### 2. Smart Answer Adjustment

```
"Analyze the keywords and requirements in the current JD, then select the most matching project experiences and skills from my resume to generate a targeted self-introduction (200 words)."
```

### 3. Handle CAPTCHAs and Special Cases

```
"Detected a slider CAPTCHA on the page, please pause automatic operations and wait for me to manually complete the verification before continuing."
```

## ⚠️ Important Notes

1. **Follow Platform Rules**
   - Ensure usage complies with the recruiting platform's terms of service
   - Avoid mass submissions in a short time that could flag your account

2. **Information Accuracy**
   - Always manually review key information after AI filling
   - Pay special attention to sensitive fields like salary and start date

3. **Privacy Protection**
   - Don't paste complete sensitive information like ID numbers directly in prompts
   - Use environment variables or config files for private data

4. **File Uploads**
   - Resume files, portfolios, etc. usually require manual upload
   - AI can locate the upload button, but actual uploading needs manual operation

## 🌟 Supported Platforms

Tested and working:
- ✅ LinkedIn
- ✅ Indeed
- ✅ Glassdoor
- ✅ Monster
- ✅ ZipRecruiter

Partial support (may need adjustments):
- ⚠️ Lever (some pages have anti-scraping mechanisms)
- ⚠️ Company career pages (structure varies greatly)

## 📚 Related Resources

- [Playwright MCP Official Documentation](https://github.com/modelcontextprotocol/servers/tree/main/src/playwright)
- [Cursor IDE Official Website](https://cursor.sh/)
- [MCP Protocol Introduction](https://modelcontextprotocol.io/)

## 🤝 Contributing

Contributions of your experiences and optimization suggestions are welcome!

1. Fork this project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Especially welcome:
- 💡 New prompt templates
- 🐛 Bug fixes and usage tips
- 📝 Platform adaptation experiences
- 🌍 Multi-language support

## 📝 FAQ

**Q: Which AI tools are supported?**

A: Any MCP-compatible tool works:
- Claude Desktop (official Anthropic app)
- Cursor IDE
- VSCode with MCP extension
- Windsurf
- Any other tool supporting Model Context Protocol

**Q: Why use real browser instead of headless automation?**

A: Real browsers are:
- Not detected as bots by recruiting platforms
- Can use your existing login sessions
- Handle CAPTCHAs and complex auth flows naturally
- Safer from account bans
- More reliable for sites with anti-bot protection

**Q: Is my data secure?**

A: Absolutely. Everything is stored locally on your machine:
- No cloud servers involved
- No data sent to external services
- You have complete control over your information
- Can delete anytime

**Q: Can I really just chat with it in natural language?**

A: Yes! Examples:
- "Apply to Software Engineer jobs in Seattle posted today"
- "Show me my application history"
- "Apply to 10 React developer positions this week"

The AI understands context and executes complex workflows from simple descriptions.

**Q: What if the AI fills in inaccurate content?**

A: 
1. You can always review before final submission
2. Optimize your resume document structure with clear formatting
3. Provide explicit instructions in your commands
4. The bot learns from corrections

**Q: How does the company whitelist work?**

A: Simply tell the bot which companies you're interested in:
```
"Only apply to: Google, Amazon, Microsoft"
"Apply to any company except: recruiting agencies"
```

**Q: Can it handle different application forms?**

A: Yes! The AI adapts to:
- LinkedIn Easy Apply
- Indeed applications
- Greenhouse forms
- Lever applications
- Custom company career pages

**Q: Is this considered cheating or unethical?**

A: Not at all. You're still:
- Providing real information from your actual resume
- Targeting positions you're qualified for
- Available for interviews if selected
- This just automates the tedious form-filling process

Think of it as having an assistant - still you, just more efficient.

For more questions, see [FAQ](docs/faq.md) or submit an [Issue](https://github.com/yourusername/ai-resume-applier/issues).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## ⭐ Star History

If this project helps you, please give it a Star!

---

**Disclaimer**: This tool is for learning and efficiency improvement only. Users are responsible for using this tool and must comply with the terms of service of relevant platforms. The author is not responsible for any issues arising from the use of this tool.

Made with ❤️ by [Your Name]