# Skill Rules

All skills must follow these 10 mandatory rules:

## Rule A: Goals
Start with clear goals defining what the skill achieves.
- Goals should be concise and actionable
- Describe the primary purpose and expected outcomes
- Answer: "What will this skill enable an agent to do?"

## Rule B: Acceptance Criteria
Include 3+ testable success criteria.
- Criteria should be specific, measurable, and testable
- Define when the agent has successfully completed the task
- Answer: "How does an agent know it succeeded?"

## Rule C: Decision Management
Provide decision trees for edge cases and failures.
- Define fallback strategies when primary approaches fail
- Include reasoning for choosing between alternative approaches
- Answer: "What does the agent do when things don't go as planned?"

## Rule D: Triggers
Define when to use this skill (10-20 word description).
- Define specific user intents or situations that activate this skill
- Include keyword patterns or phrase matches
- Answer: "When should an agent use this skill?"

## Rule E: Steps, Tasks, and Checklists
Break operations into ordered steps with checklists.
- Use numbered steps for sequences, bullets for lists, code blocks for commands
- Each step should explain what to do and why
- Include checklists for verification points
- Answer: "What does the agent do, in what order, and why?"

## Rule F: Human Interaction
Define when human approval/advice/feedback is needed.
- Define clear scenarios requiring human intervention
- Specify what information to present to the human
- Indicate whether approval, advice, or feedback is needed

## Rule G: Permissions
Specify required access rights and modification scope.
- System permissions: file system access, network access, administrative privileges
- Resource access: which files, directories, APIs, databases the skill can access
- Scope of modification: what data/resources the skill can create, modify, or delete

## Rule H: Tool Usage
List all required tools and command patterns.
- Tool dependencies: which command-line tools, packages, or agents are required
- Command patterns: exact command formats, flags, and parameters
- Sequential vs parallel: tool call order and dependencies

## Rule I: Format and Structure
Use agent-friendly markdown: numbered steps, bullets, code blocks. No fluff.
- Numbered steps for sequences (1, 2, 3...)
- Bullets for lists (•)
- Code blocks for commands, examples, templates
- NO intros, fluff, or changelogs
- NO embedded large documentation files

## Rule J: README Documentation
Include installation, features, when to use, and usage sections.
- Installation: Clear instructions on how to install the skill
- Features: Overview of what the skill does and its capabilities
- When to use: Guidance on appropriate use cases and scenarios
- Usage: Basic usage examples and commands

---

This skill complies with all 10 rules.