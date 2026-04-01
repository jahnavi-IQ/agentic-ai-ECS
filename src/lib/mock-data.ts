//Path: src\lib\mock-data.ts
import { Conversation, Template, ModelConfig } from '@/types';

export const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'Building Enterprise AI Platform',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    messageCount: 15,
    preview: 'Discussed architecture and AWS deployment strategies...',
  },
  {
    id: '2',
    title: 'ML Model Optimization',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    messageCount: 8,
    preview: 'Exploring hyperparameter tuning techniques...',
  },
  {
    id: '3',
    title: 'Data Pipeline Design',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    messageCount: 23,
    preview: 'Created ETL pipeline for real-time processing...',
  },
];

export const mockTemplates: Template[] = [
  /* GENERAL FOLDER
  
  {
    id: 'research-agent',
    name: 'Research Agent',
    description: 'Conduct comprehensive research on any topic with cited sources',
    prompt: 'Conduct comprehensive research on [topic]. Provide key findings, multiple perspectives, and cite credible sources.',
    icon: '🔍',
    category: 'General',
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Analyze datasets and generate insights with visualizations',
    prompt: 'Analyze the following data and provide insights, trends, patterns, and actionable recommendations with supporting evidence.',
    icon: '📊',
    category: 'General',
  },
  {
    id: 'content-writer',
    name: 'Content Writer',
    description: 'Create engaging, SEO-optimized content for any purpose',
    prompt: 'Write engaging, well-structured content about [topic]. Focus on clarity, flow, and audience engagement with SEO best practices.',
    icon: '✍️',
    category: 'General',
  },
  */
  // HR FOLDER
  {
    id: 'career-amplify-journey',
    name: 'Career Profile: Amplify My Journey',
    description: 'Transform resume into outcomes-driven career narrative with quantifiable achievements, skill evolution, and unique value proposition for it\'s designated role.',
    prompt: `Transform your resume into a compelling career narrative.

Deliverables:
- Executive Summary (150-200 words): Career trajectory and core value
- Chronological Narrative (400-600 words): Story connecting roles, achievements, growth
- Impact Highlights: 5-7 quantified achievements with business context(if applicable)
- Signature Strengths: 3-4 differentiating capabilities

Analysis:
Map chronological journey and pivotal roles. Convert responsibilities into quantifiable achievements (%, $, timelines). Synthesize unique professional identity.

Quality Standards:
Ground all claims in resume evidence. Quantify impact wherever possible. Use action-oriented finance sector terminology. Maintain professional tone for leadership review. Avoid generic phrases; ensure specificity and authenticity.

Input: Attach resume/CV (PDF, DOCX) or paste text. Constraints(Optional): target audience context (internal promotion, executive review, talent assessment).

Begin analysis.
Note: whatever above category of info is applicable for the input, analyze those aspects and the rest of categories highlight not available
`,
    icon: '🎯',
    category: 'HR',
  },
  {
    id: 'career-extract-strengths',
    name: 'Career Profile: Extract My Strengths',
    description: 'Identify core strengths, skills, and impact areas through evidence-based competency mapping across technical, leadership, strategic, and operational dimensions.',
    prompt: `Analyze resume to identify core strengths, skills, and impact areas.

Output - Core Strengths Profile:

1. Primary Strengths (Top 3-5): Most distinctive capabilities with proficiency level, 2-3 evidence examples, impact demonstrated

2. Secondary Strengths (3-5): Well-developed supporting capabilities with 1-2 evidence points

3. Emerging Strengths (2-3): Developing capabilities with growth trajectory

4. Skill Inventory: Comprehensive categorized list with proficiency indicators, certifications, tools, systems

5. Unique Differentiators: 2-3 rare combinations or standout capabilities

Categorization Across:
- Technical/Functional (financial analysis, regulatory compliance, treasury, audit, risk, systems)
- Leadership & People (team management, stakeholder influence, collaboration, mentoring)
- Strategic & Analytical (problem-solving, strategic thinking, data-driven decisions, business acumen)
- Operational Excellence (process improvement, project management, efficiency, quality)
- Communication & Influence (presentation, executive communication, negotiation, relationships)

Confidence Levels: ● Strong evidence | ◐ Moderate | ○ Inferred

Input: Attach resume/CV or paste description. Optional: target competency framework.

Note: whatever above category of info is applicable for the input, analyze those aspects and the rest of categories highlight not available
Proceed with extraction.`,
    icon: '💪',
    category: 'HR',
  },
  {
    id: 'career-generate-summary',
    name: 'Career Profile: Generate My Summary',
    description: 'Create four polished professional summary variants optimized for different contexts: executive profiles, internal directories, networking bios, and elevator pitches.',
    prompt: `Create four professional summary variants.

1. Executive Summary (100-125 words)
For leadership review, promotion materials. Include: current role + experience + domain, 2-3 signature strengths/achievements, quantified outcomes, unique capability/perspective, future expertise trajectory.

2. Professional Profile (50-75 words)
For internal directory, team pages. Include: role + department + tenure, key responsibilities/expertise, 1-2 achievements, certifications/specializations.

3. LinkedIn-Style Bio (150-175 words)
For external-facing, networking. First-person narrative with career journey arc, core expertise, professional philosophy, notable achievements, connection point.

4. Elevator Pitch (30-40 words)
For quick introductions, events. Role + expertise + unique value in one powerful sentence.

Guidelines:
Lead with impact and outcomes. Use finance terminology appropriately. Incorporate quantifiable achievements. Maintain professional tone. Ensure cross-variant consistency. Highlight strategic competencies aligned with company priorities.

Input: Attach resume/CV, LinkedIn profile, or paste career highlights. Optional: specific use case, target word count.

Note: whatever above category of info is applicable for the input, analyze those aspects and the rest of categories highlight not available
Generate all four variants.`,
    icon: '📄',
    category: 'HR',
  },
  {
    id: 'self-evaluation-sidekick',
    name: 'Self-Evaluation Sidekick',
    description: 'Guide employees through writing evidence-based self-evaluations using STAR-C methodology, aligned to company frameworks with finance-specific emphasis on risk and compliance.',
    prompt: `Help write evidence-based self-evaluations aligned with company frameworks using STAR-C methodology.

STAR-C Achievement Structure:
- Situation: Context and business challenge
- Task: Specific responsibility/objective
- Action: Steps taken, skills applied, decisions made
- Result: Quantifiable outcomes, business impact (%, $, time savings, risk reduction)
- Connection: Link to company values/competencies

Content Sections:

Key Accomplishments: Transform bullets into impact statements with quantified results

Competency Demonstrations: 2-3 specific behavioral examples per competency showing progression/growth

Challenges & Learning: Frame setbacks as growth opportunities, demonstrate adaptability, resilience

Development Goals: Propose SMART goals aligned with career trajectory and business needs

Areas for Growth: Identify development areas constructively with improvement strategies

Finance Sector Focus:
Emphasize risk management, compliance adherence, accuracy. Highlight cross-functional collaboration (audit, operations, legal, IT). Demonstrate regulatory awareness, ethical judgment, business acumen, strategic thinking.

Input: Share achievements, rough notes, or draft. Attach company templates/frameworks if available. Specify review period.

Note: whatever above category of info is applicable for the input, analyze those aspects and the rest of categories highlight not available
Output Options: Guided drafting, draft enhancement, or complete evaluation.`,
    icon: '⭐',
    category: 'HR',
  },

  // TECHNICAL FOLDER
  {
    id: 'code-clarifier',
    name: 'Code Clarifier',
    description: 'Explain code in simple, business-friendly language emphasizing purpose, logic, and impact without requiring technical knowledge—perfect for executives and auditors.',
    prompt: `Explain code in clear, non-technical language for managers & stakeholders.

Structure:

Executive Summary (2-3 sentences): What code accomplishes in business terms, primary problem solved, key outcome.

Plain-Language Breakdown for each major section:
- Purpose: What it does (business language, e.g., "validates all transactions have proper approval signatures before processing")
- Logic Flow: How it works (step-by-step using business analogies like "quality control checkpoint in manufacturing line")
- Business Rules: Conditions, thresholds, decision points (translate if/else logic into business scenarios)
- Data Handling: Input sources (databases, files, APIs), transformations/calculations, outputs

Business Impact & Risk:
- Value: Efficiency gains, accuracy improvements, compliance support, cost implications
- Controls: Security measures, audit trails, validation mechanisms, data privacy
- Risks: Dependencies, performance considerations, limitations, maintenance needs

Guidelines:
Use business analogies (workflows, decision trees, checklists). Focus on "what" and "why" before "how". Reference finance concepts (reconciliation, validation, approval workflows). Avoid unexplained jargon.

Finance Emphasis:
Regulatory compliance (SOX, GDPR, PCI-DSS), calculation accuracy, audit capabilities, data security, financial reporting implications.

Input: Paste code or attach file. Optional: target audience, focus areas.
Note: whatever above category of info is applicable for the input, analyze those aspects only and the rest of categories skip it`,
    icon: '💡',
    category: 'Technical',
  },
  {
    id: 'code-efficiency-estimator',
    name: 'Code Efficiency Estimator',
    description: 'Evaluate Big O time/space complexity, identify performance bottlenecks, and provide prioritized optimization recommendations with implementation effort and trade-off analysis.',
    prompt: `Analyze code complexity, identify bottlenecks, and recommend optimizations.

Analysis:

1. Complexity Assessment:
Time/Space Big O notation (best/average/worst case), performance characterization, dominant factors.

2. Bottleneck Identification:
Location, problem, impact, trigger conditions, severity. Categories: inefficient loops, database operations (N+1 queries), redundant calculations, memory issues, network calls, suboptimal algorithms, data structure choice.

3. Optimization Recommendations:
For each issue: current vs. optimized approach (code examples), improvement metrics (complexity reduction, expected speedup, memory impact), implementation effort (difficulty, time, testing, risk), trade-offs (benefits, costs, considerations).

4. Prioritization:
- High-Impact, Low-Effort (do first)
- High-Impact, High-Effort (plan & execute)
- Low-Impact (if time permits)

5. Performance Projections:
Current state (execution time, memory, throughput) → After optimization (projected improvements, scalability limits).

Finance Considerations:
Performance requirements (batch processing windows, transaction SLAs, regulatory deadlines). Constraints (audit trail preservation, data integrity, compliance). Critical metrics (transaction throughput, report generation time, query response time).

Input: Paste code or attach file. Optional: current issues, scale context, SLA requirements.
Note: whatever above category of info is applicable for the input, analyze those aspects only and the rest of categories skip it`,
    icon: '⚡',
    category: 'Technical',
  },
  {
    id: 'bug-root-cause-analyzer',
    name: 'Bug Root Cause Analyzer',
    description: 'Systematically analyze error logs and stack traces to identify root causes, develop ranked hypotheses, and provide diagnostic guidance with solution recommendations.',
    prompt: `Identify root causes of software issues through systematic error analysis.

Framework:

1. Error Triage:
Type, severity, frequency, impact scope, business impact (transactions blocked, data accuracy, compliance risk). Classification: category, layer, timing, pattern.

2. Stack Trace Analysis:
Call stack examination (error flow, critical frame, suspicious elements). Key observations: entry point, progression, propagation path, failure point.

3. Root Cause Hypotheses (3-5 ranked):
For each: confidence level (High/Medium/Low), supporting evidence (stack trace clues, error message details, patterns), technical explanation (what's happening, why), validation steps (how to confirm, diagnostic commands, expected results).

4. Diagnostic Guidance:
Immediate investigation steps with specific commands. Debugging strategy: reproduce, isolate, instrument, compare.

5. Solution Recommendations:
Immediate workaround (if applicable), permanent fix (code examples), implementation details (files, testing, deployment), prevention measures (code improvements, process changes, monitoring).

6. Risk Assessment:
Impact (data integrity, system stability, compliance, financial, security). Urgency: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low.

Finance Checks:
Regulatory reporting accuracy, audit trail integrity, SOX controls, financial statement impact, calculation correctness, reconciliation impact.

Input: Paste error/stack trace or attach log. Optional: code snippet, steps, system info, recent changes.
Note: whatever above category of info is applicable for the input, analyze those aspects only and the rest of categories skip it`,
    icon: '🐛',
    category: 'Technical',
  },
  {
    id: 'architecture-simplifier',
    name: 'Architecture Simplifier',
    description: 'Translate complex system architectures into accessible explanations using business-friendly labels, analogies, and narratives for non-technical stakeholders.',
    prompt: `Translate system architecture into clear explanations for non-technical stakeholders.

Framework:

1. Executive Overview:
One-sentence summary. Business purpose (3-4 sentences): problem solved, who uses it, value delivered, key outcomes.

2. Component Breakdown:
For each major component: business-friendly label, what it does (business terms), business analogy (relatable comparison), key responsibilities, importance.

3. Data Flow Narrative:
Tell information journey: Entry point (user action, system receives) → Validation/Processing (what happens, checks) → Integration (external connections, data exchanged) → Completion (final result, records created).

4. Architectural Principles:
Explain design decisions: what it means, why we do it, business benefit, cost trade-off.

5. Stakeholder Concerns:
- Scalability: Current capacity, growth headroom, scaling approach
- Security & Compliance: Data protection, access controls, audit capabilities, regulatory alignment (SOX, PCI-DSS, GDPR)
- Reliability: Backup strategy, disaster recovery, single points of failure
- Cost Drivers: Infrastructure, integration, maintenance, scaling costs

6. Comprehensive Analogy:
Create relatable business comparison (e.g., restaurant operations, assembly line).

Finance Priorities:
Regulatory compliance, data residency, reporting capabilities, security architecture, financial operations, business continuity (RTO/RPO).

Input: Attach diagram or provide description. Optional: system purpose, target audience, focus areas.
Note: whatever above category of info is applicable for the input, analyze those aspects only and the rest of categories skip it`,
    icon: '🏗️',
    category: 'Technical',
  },

  // BUSINESS FOLDER
  {
    id: 'executive-brief-generator',
    name: 'C-Suite Snapshot: Executive Brief',
    description: 'Convert detailed status updates into executive-ready summaries using pyramid principle—conclusion first, 1 page max, with quantified impact and action clarity.',
    prompt: `Transform updates into decision-ready briefs for C-suite using pyramid principle (conclusion first).

Structure:

1. Executive Summary (3-4 sentences max):
[CURRENT STATUS/OUTCOME] + [KEY IMPLICATION] + [ACTION REQUIRED/NEXT STEP]
Lead with outcome. Highlight business impact (revenue, cost, risk, compliance, customer). Specify if decision/action needed. Use concrete numbers and timeframes. Avoid jargon.

2. Key Highlights (3-5 bullets):
- 💰 Financial: Revenue impact, cost savings/overruns, budget variance
- ⚠️ Risk: Compliance issues, operational risks, security concerns
- 📊 Performance: KPIs, metrics, efficiency gains
- 🎯 Strategic: Initiative alignment, competitive advantage
- ⏱️ Timeline: Milestones achieved/missed, schedule changes

3. Critical Issues/Decisions (if applicable):
Issue, Impact (consequence if unresolved), Options (2-3 alternatives with pros/cons/costs), Recommendation (your path with rationale), Decision needed by (date with urgency reason).

4. Looking Ahead (2-3 sentences):
Next milestones with dates, anticipated challenges/dependencies, resource needs.

Best Practices:
✅ Start with conclusion ✅ Specific numbers/dates ✅ Quantify impact ✅ Be transparent ✅ 1 page max
❌ Don't bury lead ❌ No jargon ❌ No problems without solutions ❌ No passive voice

Input: Paste update or attach document. Optional: recipient, context.
Note: whatever above category of info is applicable for the input, analyze those aspects only and the rest of categories skip it`,
    icon: '📋',
    category: 'Business',
  },
  {
    id: 'business-impact-translator',
    name: 'Business Impact Translator',
    description: 'Translate technical work into business value by mapping to financial impact, risk reduction, performance gains, and strategic advantage with audience-specific messaging.',
    prompt: `Translate technical work into business outcomes and stakeholder value.

Framework:

1. Map to Business Dimensions:
💰 Financial Impact (revenue, cost reduction, ROI, payback)
⚠️ Risk Reduction (operational, compliance, security, data integrity, fraud)
📈 Performance & Efficiency (speed, error reduction, automation, resource optimization)
🎯 Strategic Advantage (competitive differentiation, market positioning, scalability, customer experience)
👥 Stakeholder Value (customer/employee satisfaction, regulatory relationships, shareholder value)

2. Impact Statement:
[TECHNICAL WORK] enables [BUSINESS CAPABILITY] which delivers [MEASURABLE OUTCOME] resulting in [STRATEGIC BENEFIT] for [STAKEHOLDER GROUP].

3. Audience-Specific Articulation:
CFO: Cost efficiency, ROI, budget impact, audit readiness. Frame: investment justification, TCO.
CEO: Strategic objectives, competitive position, growth enablement. Frame: vision alignment, transformation.
Board: Governance, risk oversight, strategic alignment. Frame: fiduciary responsibility, long-term value.
Business Units: Operational efficiency, customer impact, productivity. Frame: operations improvement.
Customers: User experience, speed, reliability, security. Frame: customer benefit.

4. Quantification:
Cost savings: [before] - [after] = annual savings
Revenue impact: [efficiency gain] × [capacity] × [conversion] × [transaction value]
Risk reduction: [frequency reduction] × [cost per incident]

5. Context:
Benchmarking, trends (MoM/YoY), scale perspective.

Input: Describe technical project. Optional: target audience, timeframe, metrics.
Note: whatever above category of info is applicable for the input, analyze those aspects only and the rest of categories skip it`,
    icon: '💼',
    category: 'Business',
  },
  {
    id: 'decision-brief-generator',
    name: 'Decision Brief Generator',
    description: 'Create structured decision memos with clear recommendation, balanced options analysis, comparison matrix, risk assessment, and implementation roadmap—2-3 pages max.',
    prompt: `Create actionable decision memos for finance executives.

Structure:

1. Decision Summary:
Decision Required (one sentence), Recommended Action (clear choice with rationale 1-2 sentences), Decision Deadline (date with urgency reason), Decision Authority (who approves).

2. Context:
Why This Matters (problem/opportunity, strategic importance, consequences of inaction), Key Constraints (budget, timeline, regulatory, resources, technical), Success Criteria (how we'll measure correctness, KPIs, timeframe).

3. Options Analysis (2-4 alternatives):
For each: Overview (2-3 sentences), Pros (✅ specific advantages), Cons (❌ specific disadvantages), Cost (implementation, annual, 5-year TCO), Timeline (duration with milestones), Risk Level (Low/Medium/High with specific risks).

4. Comparison Matrix:
Weighted scoring table comparing options across key factors (cost, timeline, compliance, features, vendor stability, integration).

5. Recommendation & Rationale:
2-3 paragraphs: how choice meets success criteria, trade-offs accepted, risk mitigation, strategic alignment, supporting evidence.

6. Implementation (if approved):
Immediate next steps (3 actions with owners), critical path (30/60/90-day milestones), resource requirements (team, budget, external support), risk mitigation (top 3 risks).

Finance Priorities:
Regulatory compliance, risk assessment (operational/financial/compliance/strategic/reputational), TCO, stakeholder management.

Input: Describe decision context. Optional: options, constraints, data.
Note: whatever above category of info is applicable for the input, analyze those aspects only and the rest of categories skip it
Target: 2-3 pages.`,
    icon: '📊',
    category: 'Business',
  },
  {
    id: 'kpi-summary-builder',
    name: 'KPI Summary Builder',
    description: 'Transform raw metrics into executive-ready KPI summaries with trend analysis, peer comparisons, forward indicators, and actionable recommendations for leadership reviews.',
    prompt: `Create executive-ready KPI summaries for finance leadership.

Structure:

1. Performance Snapshot:
Period, Overall Health (🟢🟡🔴), Quick stats (metrics exceeding target, requiring attention, positive/declining trends).

2. Critical Metrics Dashboard:
For each metric: Current, Target (% to target), Previous (↑↓→ change %), Status (🟢🟡🔴), Trend visualization, Context (what's driving this).

3. Performance by Category:
Financial Performance (revenue, profitability, asset quality, capital adequacy)
Operational Efficiency (cost metrics, productivity, process efficiency)
Growth & Volume (asset growth, customer acquisition/retention, market share)
Customer Experience (satisfaction scores, service levels, digital adoption)
Risk & Compliance (credit quality, operational risk, compliance, cybersecurity)

For each: summary sentence, top performer, concern area, 3-5 key metrics with status/notes.

4. Trend Analysis:
Positive Momentum (improving metrics), Concerning Patterns (declining metrics, widening gaps), Correlations & Root Causes.

5. Peer Comparison:
Table: Our Performance vs. Peer Median vs. Top Quartile. Competitive positioning (2-3 sentences).

6. Forward-Looking Indicators:
Leading indicators, projected performance, catalysts & headwinds.

7. Executive Summary:
Key Takeaways (3 insights), Actions Required (🔴 Immediate, 🟡 Near-term, 🟢 Monitor), Decisions Needed.

Best Practices:
✅ Context for every number ✅ Connect to strategy ✅ Benchmark ✅ Actionable insights
❌ No raw data ❌ No unexplained variances

Input: Paste/attach KPI data. Optional: period, targets, audience.
Note: whatever above category of info is applicable for the input, analyze those aspects only and the rest of categories skip it`,
    icon: '📈',
    category: 'Business',
  },
];

export const mockModels: ModelConfig[] = [
  {
    id: 'claude-4',
    name: 'Claude 4.6 Sonnet',
    provider: 'aws-bedrock',
    maxTokens: 200000,
    costPer1M: 3.0,
  },
  {
    id: 'mistral-large-3',
    name: 'Mistral Large 3',
    provider: 'aws-bedrock',
    maxTokens: 128000,
    costPer1M: 8.0,
  },
  {
    id: 'gpt-4',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    maxTokens: 128000,
    costPer1M: 10.0,
  },
  {
    id: 'gemini',
    name: 'Gemini Pro',
    provider: 'google',
    maxTokens: 32000,
    costPer1M: 7.0,
  },
  {
    id: 'qwen-3',
    name: 'Qwen 3',
    provider: 'qwen',
    maxTokens: 32000,
    costPer1M: 5.0,
  },
];