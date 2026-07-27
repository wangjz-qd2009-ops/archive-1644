# ARCHIVE 1644 网站提升与课程方法对应

## 本轮原则

本轮没有改变游戏流程、五个调查任务、评分维度或结果阈值。修改集中在用户能否理解当前目标、注意关键操作、建立正确关联、获得清晰反馈，以及如何谨慎解释结果。

> Decision → Question → Prototype → Scenario → Behavior → Interpretation

网站仍然是研究原型，不把专家预测包装成已经被真实用户证明的结论。

## 第一节课：Conceptual Model、Signals 与 Feedback

落实内容：

- 首屏增加三步流程预览：先形成初步观点、再检查五份档案、最后进行私人复盘。
- 顶部阶段改成完整任务语言：Case Brief、First View、Evidence Files、Final Review、Reward。
- 调查板明确当前目标以及“每保存一份档案，就增加一个视角”的系统反馈。
- 保留拼图归位、完成状态和下一步按钮，降低用户对流程的猜测。

## 第二节课：User Testing、Neutral Facilitation 与 Observation

落实内容：

- 任务文案说明目标，但不告诉用户应该选择什么答案。
- 继续使用中性反馈，不把某个立场判定为正确答案。
- 结果页只描述本次案例中的行动，不把停顿、选择或群体影响直接解释为人格。
- 研究结论使用 pattern、may 和 cautious interpretation，不声称真实青少年普遍如此。

## 第三节课：Persona、Journey、IA 与 Task Analysis

落实内容：

- 使用一个明确的16岁高中生画像进行认知走查，不再依赖“平均用户”。
- 画像标注为研究假设，列出需要通过真实青少年研究验证的问题。
- 信息架构按照任务阶段命名，避免 Brief、Files 等过短标签产生歧义。
- 手机优先、容易被打断、术语陌生和害怕被评价，被转化为可检查的设计要求。

## 第四节课：Prototype、Scenario 与 Usability Test

落实内容：

- 原型只支持当前研究问题需要的关键路径，没有扩展无关功能。
- 关键流程具有足够高的交互与反馈保真度。
- 所有结果级别都允许返回检查最终选择，支持错误恢复。
- 新增回归测试，确保游戏流程、五份档案和三条结果路径仍然存在。
- 构建、代码检查和4项自动测试全部通过，可用于下一轮 pilot。

尚未声称：

- 没有真实参与者数据，因此不能声称任务成功率、严重程度或接受度已经得到验证。
- “Rook”是否真的比AI医生或AI警察更容易被青少年接受，仍需可用性测试。

## 第五节课：Related Work 与项目定位

落实内容：

- 原型的核心差异保持为：用侦探档案和多视角拼图，让青少年反思群体意见、证据类型和攻击性表达。
- AI没有被包装成新奇功能，而是隐藏在支持与安全引导的内核中。
- 可在后续报告中用 users、context、mechanism 和 evaluation 写 difference sentence。

建议的项目定位句：

> Existing media-literacy tools often teach source checking through lessons or quizzes. ARCHIVE 1644 differs by using a role-based investigation game for teenagers, where reflection emerges from evidence classification, competing perspectives, and a revisable final judgment.

## 第六节课：Evidence Pipeline 与研究证据保护

落实内容：

- 结果页新增“WHAT THIS REVIEW USED”，说明解释来自哪些实际交互。
- 明确结果只使用本案例中的选择与行动。
- 明确结果不是诊断、身份标签或法律判断。
- 明确一次案例不能证明这种模式有多普遍。
- 保留本地进度、查看档案、重新打开、阅读时间和分类选择等原有行为记录，但没有新增外部追踪或敏感数据收集。

研究时应继续记录：

- 用户在哪里停顿、回退或重新打开档案；
- 用户说了什么，以及当时界面显示什么；
- 主持人是否进行过 neutral prompt、restate 或 rescue；
- 结果属于独立完成、assisted success、failure 还是 abandoned。

## 第七节课：Heuristic Evaluation、Cognitive Walkthrough 与 Contextual Inquiry

### Heuristic Evaluation

- 系统状态、当前阶段和下一步更加可见。
- 标签使用完整、稳定的任务语言。
- 结果页增加恢复路径和解释。
- 信息层级保持克制，不添加无意义装饰。

### Cognitive Walkthrough

每个关键步骤继续检查：

- Goal：用户是否形成正确子目标？
- Notice：用户是否注意到可操作入口？
- Associate：用户是否理解入口与目标的关系？
- Feedback：用户是否知道已经完成以及下一步是什么？

### Contextual Inquiry

本轮没有虚构真实青少年行为。画像中的平台习惯、群体影响和接受度都被标注为假设，后续需要在真实使用情境中观察和追问。

## 青少年角色调整

结果页不再把用户直接面对的角色称为 AI Support Guide 或 AI Cyber-Safety Guide，而统一为档案伙伴 **Rook**：

- 轻度结果：Rook / Case Companion
- 中度结果：Rook / Support Companion
- 强警示结果：Rook / Safety Companion

支持和安全内核没有改变。界面仍然透明说明：

- Rook 使用 AI support logic，但不是心理治疗师；
- Rook 使用 AI safety logic，但没有真实警察查看账号。

这个调整的目的是降低权威和临床感，不是隐藏系统性质。

## 下一轮真实研究应验证

1. 青少年是否理解三步流程和五角色拼图？
2. “Rook”是否比AI医生/警察更可信、更少引发防御？
3. 用户是否理解结果描述的是本次行为，而不是人格？
4. 用户是否知道可以返回修改最终选择？
5. 哪些术语仍然需要更生活化的表达？
6. 档案视觉是否帮助理解证据关系，还是增加阅读负担？
7. 中断后重新进入时，用户是否能恢复当前任务？

