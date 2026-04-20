# FurMates Tidio MCP - Configuration Guide

## Prerequisites

- Node.js >= 18
- Tidio account on **Plus or Premium plan** (required for OpenAPI access)
- Tidio OpenAPI credentials (Client ID + Client Secret)

---

## Getting Tidio API Credentials

1. Go to [Tidio Panel](https://www.tidio.com/panel/settings/developer) → **Settings → Developer → OpenAPI**
2. Click **Generate API Key**
3. Copy the **Client ID** (`ci_...`) and **Client Secret** (`cs_...`) — save them securely
4. The key pair is only shown once

> ℹ️ Only the project **owner** or **admins** can access Developer settings.

---

## Environment Variables

```bash
# Required
TIDIO_CLIENT_ID=ci_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
TIDIO_CLIENT_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional
DEBUG=false
```

> ⚠️ **NEVER commit these to Git.** Use environment variables or a secrets manager.

---

## Installation

```bash
cd mcp/tidio-mcp
npm install
npm run build
npm test        # Run unit tests (no credentials required)
```

---

## Running the Server

```bash
TIDIO_CLIENT_ID=ci_xxx \
TIDIO_CLIENT_SECRET=cs_xxx \
node dist/index.js
```

### Claude Code / OpenClaw mcporter Integration

```json
{
  "mcpServers": {
    "furmales-tidio": {
      "command": "node",
      "args": ["/path/to/mcp/tidio-mcp/dist/index.js"],
      "env": {
        "TIDIO_CLIENT_ID": "ci_xxx",
        "TIDIO_CLIENT_SECRET": "cs_xxx"
      }
    }
  }
}
```

---

## Available Tools (19 total)

### Conversations (7 tools)
| Tool | Description |
|------|-------------|
| `list_conversations` | List conversations with status/assignee filters |
| `get_conversation` | Get full conversation details |
| `close_conversation` | Mark as solved, optional closing message |
| `reopen_conversation` | Reopen a solved conversation |
| `assign_conversation` | Assign to specific operator |
| `unassign_conversation` | Remove current assignment |
| `list_operators` | List all agents with IDs and status |

### Messages (5 tools)
| Tool | Description |
|------|-------------|
| `get_conversation_history` | Read full message thread |
| `send_message` | Send reply visible to customer |
| `add_internal_note` | Add note visible to agents only |
| `get_unread_conversations` | Get conversations needing attention |
| `generate_reply_draft` | Generate FurMates-branded reply draft |

### Contacts (7 tools)
| Tool | Description |
|------|-------------|
| `list_contacts` | List all contacts |
| `search_contacts` | Search by name/email/phone |
| `get_contact` | Get contact details + custom properties |
| `update_contact` | Update name, email, tags, properties |
| `get_contact_conversations` | Get contact's conversation history |
| `tag_angel_customer` | Promote to Angel Customer (vip + angel tags) |
| `detect_customer_intent` | Classify intent: refund/shipping/complaint/etc |

---

## Angel Customer Workflow

The `tag_angel_customer` tool integrates with the FurMates Angel Customer program:

1. Playfish identifies a high-value customer
2. Calls `tag_angel_customer` with the contact ID and reason
3. Contact gets tagged `angel-customer` + `vip` in Tidio
4. Custom property `angel_customer_since` is recorded
5. These contacts get priority routing in future conversations

---

## Webhook Events (Optional Enhancement)

To receive real-time notifications, configure a webhook in Tidio Panel → Settings → Developer → Webhooks. Supported events:

- `conversation.created` — New conversation started
- `message.created` — New message received
- `conversation.solved_automatically` — Auto-resolved conversation

---

## Troubleshooting

**`Missing required env vars`** → Set `TIDIO_CLIENT_ID` and `TIDIO_CLIENT_SECRET`.

**`Tidio API 401`** → Invalid credentials. Regenerate in Tidio Panel.

**`Tidio API 403`** → Your plan doesn't support OpenAPI. Upgrade to Plus/Premium.

**`Tidio API 429`** → Rate limited. Client retries automatically after `Retry-After` seconds.

**Conversations not visible** → Check that the API key owner has the correct role (owner/admin).
