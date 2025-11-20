# LinkedIn 自动申请任务

## 任务说明

打开 LinkedIn，搜索 24 小时内发布的 software engineer 岗位，帮我申请最新的 20 条职位。

## 个人信息来源

我的个人信息存储在 `data/` 文件夹下：
- `SampleResume.tex` / `SampleResume.pdf` - 简历信息
- `config.json` - 配置文件（包含个人信息、申请表单答案等）

配置文件在 `data/config.json`，包含：
- 个人信息（姓名、邮箱、电话等）
- 工作授权信息（工签/签证要求）
- 人口统计信息（少数族裔、退伍军人等）
- 可用性信息（开始时间、搬迁意愿等）
- 经验信息（工作年限、相关经验等）
- 申请表单答案映射

## 操作要求

1. **减少操作次数**：尽量减少调用 snapshot 的次数。当看到所有 input field 后，一次性根据我的信息全部填写完，减少总的操作次数。

2. **信息处理**：
   - 优先从 `data/` 文件夹和 `data/config.json` 读取信息
   - 如果遇到不确定或未提供的信息，先根据上下文做合理假设
   - 将所有假设和不确定的信息记录到 `data/knowledge.json` 文件中，格式：`{"question": "问题内容", "assumedAnswer": "假设的答案", "timestamp": "时间戳"}`

3. **申请记录**：
   - 每完成一个申请后，**立即**将岗位信息记录到 `data/applied.json`
   - 记录格式：
     ```json
     {
       "company": "公司名",
       "jobTitle": "岗位名",
       "postedTime": "发布时间（如：19 hours ago）",
       "applicationTime": "投递时间（ISO 8601 格式，精确到小时分钟秒，如：2025-11-17T00:16:12Z）",
       "link": "岗位链接（尽量保留，即使是 Easy Apply 也要记录）"
     }
     ```
   - **重要**：`applicationTime` 必须使用申请完成时的**实际时间戳**，使用 `date -u +"%Y-%m-%dT%H:%M:%SZ"` 获取当前 UTC 时间，不要使用固定时间戳或占位符。
   - **重要**：尽量申请保留 `link` 字段，即使是 Easy Apply 也要记录岗位链接，方便后续查看和追踪。

4. **表单填写**：
   - 读取 `data/config.json` 中的 `applicationFormAnswers.fieldMappings` 来匹配表单问题
   - 使用 `applicationFormAnswers.commonQuestions` 中的值来填写
   - 如果问题不匹配，参考 `personalInfo`、`workAuthorization`、`demographics`、`availability`、`experience` 等字段
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

## 文件结构

```
apply-bot/
├── data/
│   ├── SampleResume.pdf
│   ├── SampleResume.tex
│   └── config.json (主配置文件)
├── data/
│   ├── applied.json (申请记录)
│   └── knowledge.json (不确定信息记录)
└── readme.md (本文件)
```
