# Task: Email Automation for Lead Nurturing

**Priority**: P2  
**Status**: Open  
**Created**: 2026-04-19

---

## 🎯 Objective

Set up automated email sequences to nurture leads from first contact to Angel Customer conversion.

## 📁 Reference Files

- Customer Service Manual: `/PROJECTS/PetOPC/CUSTOMER_SERVICE_MANUAL.md`
- Angel Invite: `/PROJECTS/PetOPC/ANGEL_CUSTOMER_INVITE.md`
- Leads in Mission Control: Task IDs starting with "Lead:"

## 📋 Tasks

### 1. Configure Gmail Integration
- [ ] Set up Gmail API OAuth
- [ ] Test sending emails via gog
- [ ] Configure email templates

### 2. Create Email Templates
- [ ] Welcome email (Day 0)
- [ ] Product intro (Day 3)
- [ ] Limited offer (Day 7)
- [ ] Final reminder (Day 14)
- [ ] Wake up (Day 21)

### 3. Lead Nurturing Workflow
- [ ] Monitor Mission Control for new leads
- [ ] Auto-send Day 0 welcome
- [ ] Schedule Day 3/7/14/21 follow-ups
- [ ] Track engagement

### 4. Angel Customer Sequence
- [ ] Send welcome with 50% OFF code
- [ ] Send product info
- [ ] Send testimonial
- [ ] Send urgency reminder
- [ ] Handle objections

## 📧 Email Templates

Use templates from `CUSTOMER_SERVICE_MANUAL.md`:

| Day | Subject | Template |
|-----|---------|----------|
| 0 | Welcome to FurMates Family! | Welcome email |
| 3 | What makes FurMates different? | Product intro |
| 7 | 7 days left, {name} | Limited offer |
| 14 | Last chance, {name}! | Final reminder |
| 21 | Hey {name}, still there? | Wake up |

## 🔧 Tech Stack

- Gmail: `gog gmail send`
- Scheduling: Jarvis Mission Control
- Tracking: Leads in Mission Control

## ✅ Success Criteria

- [ ] Auto-send welcome within 1 hour
- [ ] 21-day sequence working
- [ ] Open rate > 30%
- [ ] First Angel conversion

## 📁 Deliverables

- Email templates in `scripts/email-templates/`
- Gmail automation in `scripts/gmail-auto/`
- Documentation in `docs/EMAIL_AUTOMATION.md`
