# FurMates Automation - Claude Code Instructions

**Project**: FurMates Shopify Automation  
**Last Updated**: 2026-04-19

---

## 🎯 Mission

Build an autonomous AI agent system that operates the FurMates e-commerce business with minimal human intervention.

**Primary Agent**: Playfish (OpenClaw) - Coordinates all operations  
**Development Agent**: Claude Code (Mac A) - Executes technical tasks

---

## 📁 Project Structure

```
furmales-automation/
├── tasks/           # Development tasks for Claude Code
├── mcp/             # MCP servers to be developed
├── scripts/         # Automation scripts
└── .github/         # GitHub Actions workflows
```

---

## 🚀 Quick Start

### When Claude Code Starts

1. Read `tasks/TASK_SHOPIFY_MCP.md` or `tasks/TASK_TIDIO_MCP.md`
2. Check current status in GitHub Issues
3. Execute the task
4. Report completion in the Issue
5. Create PR with the implementation

### Development Workflow

```
GitHub Issue Created → Claude Code Notified → Development → PR → Review → Merge
```

---

## 📋 Current Tasks

| Task | Priority | Status |
|------|----------|--------|
| Shopify MCP Development | P0 | Open |
| Tidio MCP Development | P1 | Open |

---

## 🔧 Development Standards

### Code Quality
- TypeScript with strict mode
- Comprehensive error handling
- Detailed logging
- Unit tests required

### MCP Server Standards
- Follow MCP SDK specification
- Support stdio transport
- Include tool descriptions
- Document all endpoints

### Git Workflow
- Create feature branch
- Submit PR when complete
- Include test results
- Update issue status

---

## 🚫 Important Rules

1. **NEVER modify MiniAIpdf codebase**
2. **NEVER commit API credentials** - use environment variables
3. **ALWAYS test before submitting PR**
4. **UPDATE the task issue** when status changes

---

## 🔗 Related Systems

- **Playfish (Main Agent)**: Coordinates operations via Jarvis Mission Control
- **Jarvis Mission Control**: https://jarvis-mission-control-seven.vercel.app
- **FurMates Shopify**: xcwpr0-du.myshopify.com
- **Make.com Webhook**: https://hook.us2.make.com/amefr2twablag8f26ygtifj5jm2xg6ym

---

## 💬 Communication

- Tasks are tracked in GitHub Issues
- Claude Code reports to Playfish via Telegram
- Playfish coordinates with Terry

---

*For Playfish: Use GitHub Issues to assign tasks to Claude Code*
