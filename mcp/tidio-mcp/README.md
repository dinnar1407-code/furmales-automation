# FurMates Tidio MCP Server

AI-powered customer service via Tidio Model Context Protocol (MCP).

## Features

- **Conversations**: List, get details, close, mark as read
- **Messages**: Send messages to customers
- **Contacts**: Get and list customer information

## Installation

```bash
cd mcp/tidio-mcp
npm install
```

## Configuration

Set these environment variables:

```bash
TIDIO_API_KEY=your_public_key
TIDIO_API_SECRET=your_private_key
```

Get your API keys from: https://www.tidio.com/panel/settings/developer

## Usage

```bash
# Build
npm run build

# Run
npm start

# Development
npm run dev
```

## Tools Available

| Tool | Description |
|------|-------------|
| `list_conversations` | List active conversations |
| `get_conversation` | Get conversation details |
| `send_message` | Send message to customer |
| `get_contact` | Get contact information |
| `list_contacts` | List all contacts |
| `close_conversation` | Close a conversation |
| `mark_as_read` | Mark conversation as read |

## Connect to Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "furmales-tidio": {
      "command": "node",
      "args": ["/path/to/furmales-automation/mcp/tidio-mcp/dist/index.js"],
      "env": {
        "TIDIO_API_KEY": "your_public_key",
        "TIDIO_API_SECRET": "your_private_key"
      }
    }
  }
}
```

## Connect to OpenClaw

Add to mcporter config:

```json
{
  "mcpServers": {
    "tidio-furmales": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "TIDIO_API_KEY": "your_public_key",
        "TIDIO_API_SECRET": "your_private_key"
      }
    }
  }
}
```

## Tidio API Reference

This MCP uses the Tidio REST API:
- Base URL: `https://api.tidio.com`
- Auth: `Authorization: ApiKey your_api_key`

---

*Built by the FurMates AI Agent Team*
