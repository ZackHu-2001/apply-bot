# LinkedIn 自动申请任务

## 任务说明

打开 LinkedIn，搜索 24 小时内发布的 software engineer 岗位，帮我申请最新的 20 条职位。

## 个人信息来源

我的个人信息存储在 `data/` 文件夹下：
- **`resume.txt`** - 完整简历文本（个人信息、工作经验、教育背景、技能）
- **`knowledge.json`** - 预先回答的申请问题（工作授权、人口统计、可用性信息）
- **`job-filters.json`** - 职位过滤偏好（黑白名单、薪资、工作类型、技术栈）
- **`resume-meta.json`** - 简历元数据（源文件、解析日期）

## 操作要求

1. **详细模式 - 解释每一步操作**：对于你执行的每一个操作，请简要说明：
   - 你要做什么
   - 为什么要这样做（依据/理由）
   - 你遵循的是什么信息或规则
   - 示例："填写工作授权字段为 'Yes'，因为 knowledge.json 显示不需要工签"
   - 示例："跳过这个职位，因为公司 'XYZ' 在 job-filters.json 的黑名单中"
   - 示例："选择 'Male' 作为性别，因为 knowledge.json 中记录了这个答案"
   - 示例："填写邮箱为 'john@example.com'，从 resume.txt 中获取"

2. **减少操作次数**：尽量减少调用 snapshot 的次数。当看到所有 input field 后，一次性根据我的信息全部填写完，减少总的操作次数。

2. **信息处理**：
   - 优先从 `data/resume.txt` 读取个人/简历信息
   - 如果遇到不确定或未提供的信息，先根据上下文做合理假设
   - **重要：每次填写假设的答案后，必须立即记录到 `data/knowledge.json`**
   - 记录格式：
     ```json
     {
       "question": "原始问题文本",
       "assumedAnswer": "假设的答案",
       "reasoning": "做出此假设的原因（可选）",
       "timestamp": "时间戳"
     }
     ```
   - **需要记录的情况示例**：
     - "Selenium 经验年限？" → 如果 resume.txt 或 knowledge.json 中没有，必须记录
     - "JSON 经验年限？" → 如果 resume.txt 或 knowledge.json 中没有，必须记录
     - 任何技术相关的经验年限问题
     - 任何你估算或推断答案的问题

3. **申请记录**：
   - 每完成一个申请后，**立即**将岗位信息记录到 `data/applied.json`
   - 记录格式：
     ```json
     {
       "company": "公司名",
       "jobTitle": "岗位名",
       "postedTime": "岗位发布时间（ISO 8601 时间戳，从相对时间计算得出）",
       "applicationTime": "投递时间（ISO 8601 格式，精确到小时分钟秒，如：2025-11-17T00:16:12Z）",
       "status": "applied" 或 "needs-human-review",
       "link": "岗位链接（尽量保留，即使是 Easy Apply 也要记录）"
     }
     ```
   - **重要**：`applicationTime` 必须使用申请完成时的**实际时间戳**，使用 `date -u +"%Y-%m-%dT%H:%M:%SZ"` 获取当前 UTC 时间，不要使用固定时间戳或占位符。
   - **重要**：`postedTime` 必须从 LinkedIn 显示的相对时间（如 "7 hours ago"、"2 days ago"）计算得出。通过从当前时间减去该时长来计算实际时间戳。使用 ISO 8601 格式（如 2025-11-17T00:16:12Z）。这样可以确保时间准确且可以正确排序。
   - **重要**：尽量申请保留 `link` 字段，即使是 Easy Apply 也要记录岗位链接，方便后续查看和追踪。
   - **状态说明**：
     - `status: "applied"` - 成功完成申请（默认状态，如果未指定则默认为此状态）
     - `status: "needs-human-review"` - 需要人工介入（如表单过于复杂、需要额外信息、验证码、无法自动完成等），**必须提供 `link` 字段**，方便人工后续处理

4. **表单填写**：
   - 检查 `data/knowledge.json` 中是否有之前回答的问题 来匹配表单问题
   - 从 `data/resume.txt` 提取个人详情、工作经验等
   - 如果问题不匹配，使用 `data/job-filters.json` 获取职位偏好
   - 遇到无法确定的问题，填写后记录到 `data/knowledge.json`
   
   **重要 - LinkedIn 表单元素特殊处理**：
   - LinkedIn 的 radio/checkbox 按钮的 `value` 属性通常是 UUID，而不是可见文本（如 "Yes"/"No"）
   - 如果通过 `browser_click` 或 CSS 选择器无法选中 radio/checkbox，使用以下方法：
     1. 使用 `browser_evaluate` 检查实际 DOM 结构，找到元素的真实 ID
     2. 通过 `getElementById` 直接获取元素
     3. 执行：`element.click()` → `element.checked = true` → 手动触发事件：
        ```javascript
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('click', { bubbles: true }));
        ```
   - 对于文本输入框，优先使用 `browser_type` 工具
   - 对于下拉框，使用 `browser_select_option` 工具
   - 如果表单验证失败，检查是否所有必填字段都已正确填写，特别是 radio/checkbox 是否真的被选中

5. **弹窗关闭优化**：
   - **问题**：使用 `browser_click` 点击关闭按钮（如 "Done"、"Dismiss"）时，虽然弹窗已经关闭，但工具可能还在等待页面完全加载或异步操作完成，导致响应很慢
   - **原因**：LinkedIn 在关闭弹窗时可能执行了以下操作：
     - 发送分析数据到服务器
     - 更新页面状态
     - 触发多个事件监听器
     - 等待网络请求完成
   - **解决方案**：优先使用以下快速关闭方法：
     1. **按 ESC 键**（最快）：使用 `browser_press_key` 工具按 `Escape` 键
     2. **直接触发 ESC 事件**：使用 `browser_evaluate` 执行：
        ```javascript
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        ```
     3. **点击背景遮罩层**：如果弹窗有关闭背景点击功能，直接点击背景
   - **注意**：如果只是关闭弹窗继续下一步操作，不需要等待 `browser_click` 完成，可以直接使用 `browser_evaluate` 或 `browser_press_key` 快速关闭

6. **其他提示**：
   - 建议先 disable Simplify 扩展（如果启用）
   - 优先申请带有 "Easy Apply" 标签的职位
   - 如果表单过于复杂或无法完成，跳过并记录原因

7. **会话日志记录**：
   - 在每次申请会话开始时，在 `data/logs.json` 创建日志
   - 创建新会话，格式：
     ```json
     {
       "id": "session-{timestamp}",
       "name": "LinkedIn 自动申请 - {日期}",
       "createdAt": "ISO 时间戳",
       "entries": []
     }
     ```
   - 对于每个重要操作，追加日志条目：
     ```json
     {
       "timestamp": "ISO 时间戳",
       "action": "简短操作描述",
       "reason": "为什么执行此操作（详细解释）",
       "result": "操作结果（可选）",
       "type": "info|success|warning|error"
     }
     ```
   - **记录这些事件**：
     - 开始申请某个职位 (type: info)
     - 填写每个表单字段及原因 (type: info)
     - 跳过某个职位及原因 (type: warning)
     - 成功提交申请 (type: success)
     - 遇到错误或问题 (type: error)
     - 使用假设的答案 (type: warning)
   - 在会话结束时，更新会话摘要：
     ```json
     {
       "summary": {
         "totalApplications": 数量,
         "successful": 数量,
         "needsReview": 数量,
         "skipped": 数量
       }
     }
     ```

## 文件结构

```
apply-bot/
├── data/
│   ├── resume.txt (解析后的简历文本)
│   ├── resume-meta.json (简历元数据)
│   ├── applied.json (申请记录)
│   ├── knowledge.json (预先回答的问题)
│   ├── job-filters.json (职位过滤偏好)
│   └── logs.json (会话日志)
└── readme.md (本文件)
```