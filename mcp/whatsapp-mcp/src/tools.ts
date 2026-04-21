/**
 * WhatsApp MCP Tools — FurMates Automation
 * send_message | get_messages | mark_read | get_contact
 */
import { TwilioWhatsAppClient } from './twilio-client.js';

// ─── Tool Definitions ─────────────────────────────────────────────────────────

export const whatsappTools = [
  {
    name: 'send_whatsapp_message',
    description:
      'Send a WhatsApp message to a customer via Twilio. Supports text and media (image URL). ' +
      'Use for order notifications, Angel Customer welcome messages, and support replies. ' +
      'Phone numbers in E.164 format (+1234567890) or with whatsapp: prefix.',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient phone number in E.164 format, e.g. +14155551234' },
        message: { type: 'string', description: 'Message text to send (max 4096 chars for WhatsApp)' },
        media_url: { type: 'string', description: 'Optional public URL of an image/video to send as media' },
      },
      required: ['to', 'message'],
    },
  },
  {
    name: 'get_whatsapp_messages',
    description: 'Retrieve WhatsApp message history from Twilio. Filter by recipient, sender, limit, or date.',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Filter messages sent to this number (E.164)' },
        from: { type: 'string', description: 'Filter messages received from this number (E.164)' },
        limit: { type: 'number', description: 'Number of messages to return (default: 20, max: 100)', default: 20 },
        date_after: { type: 'string', description: 'Filter messages sent after this ISO date, e.g. 2026-04-01' },
      },
    },
  },
  {
    name: 'mark_whatsapp_read',
    description: 'Mark a specific WhatsApp message as read using its Twilio message SID.',
    inputSchema: {
      type: 'object',
      properties: {
        message_sid: { type: 'string', description: 'Twilio message SID (starts with SM...), e.g. SM1234567890abcdef' },
      },
      required: ['message_sid'],
    },
  },
  {
    name: 'get_whatsapp_contact',
    description: 'Get WhatsApp contact info and message history for a specific phone number.',
    inputSchema: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: 'Phone number in E.164 format, e.g. +14155551234' },
      },
      required: ['phone'],
    },
  },
  {
    name: 'send_whatsapp_order_notification',
    description: 'Send a pre-formatted order notification WhatsApp message to a customer.',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Customer phone number in E.164 format' },
        customer_name: { type: 'string', description: 'Customer first name' },
        order_number: { type: 'string', description: 'Shopify order number, e.g. #1001' },
        notification_type: { type: 'string', enum: ['order_confirmed', 'order_shipped', 'order_delivered', 'order_cancelled'], description: 'Type of order notification' },
        tracking_number: { type: 'string', description: 'Shipping tracking number (for order_shipped type)' },
        tracking_url: { type: 'string', description: 'Tracking URL (for order_shipped type)' },
      },
      required: ['to', 'customer_name', 'order_number', 'notification_type'],
    },
  },
];

const ORDER_TEMPLATES = {
  order_confirmed: ({ customer_name, order_number }) =>
    `🐾 Hi ${customer_name}! Your FurMates order ${order_number} has been confirmed. We're getting it ready for your fur baby! We'll message you when it ships. — The FurMates Team`,
  order_shipped: ({ customer_name, order_number, tracking_number, tracking_url }) =>
    `📦 Great news, ${customer_name}! Your FurMates order ${order_number} is on its way!\n\n` +
    (tracking_number ? `Tracking: ${tracking_number}\n` : '') +
    (tracking_url ? `Track here: ${tracking_url}\n` : '') +
    `\nEstimated delivery: 3–5 business days. — The FurMates Team 🐾`,
  order_delivered: ({ customer_name, order_number }) =>
    `✅ Your FurMates order ${order_number} has been delivered, ${customer_name}! 🎉\n\nWe hope your pet loves it! If you have any questions, just reply to this message.\n\nLoving FurMates? Leave us a quick review → furmales.com/review 🐾`,
  order_cancelled: ({ customer_name, order_number }) =>
    `Hi ${customer_name}, your FurMates order ${order_number} has been cancelled. Your refund will appear within 5–7 business days. Questions? Reply here or email hello@furmales.com — The FurMates Team 🐾`,
};

export async function handleWhatsAppTool(name, args, client) {
  switch (name) {
    case 'send_whatsapp_message': {
      const { to, message, media_url } = args;
      const result = await client.sendMessage(to, message, media_url);
      return { content: [{ type: 'text', text: `✅ WhatsApp message sent!\nSID: ${result.sid}\nTo: ${result.to}\nStatus: ${result.status}\n\nMessage: "${message}"` }] };
    }
    case 'get_whatsapp_messages': {
      const { to, from, limit, date_after } = args;
      const messages = await client.getMessages({ to, from, limit, dateSentAfter: date_after });
      const formatted = messages.map(m => ({ sid: m.sid, direction: m.direction, from: m.from, to: m.to, body: m.body, status: m.status, sent_at: m.date_sent || m.date_created }));
      return { content: [{ type: 'text', text: `Found ${messages.length} WhatsApp messages:\n\n${JSON.stringify(formatted, null, 2)}` }] };
    }
    case 'mark_whatsapp_read': {
      const { message_sid } = args;
      const result = await client.markRead(message_sid);
      return { content: [{ type: 'text', text: `✅ Message ${message_sid} marked as read. Status: ${result.status}` }] };
    }
    case 'get_whatsapp_contact': {
      const { phone } = args;
      const contact = await client.getContact(phone);
      return { content: [{ type: 'text', text: JSON.stringify(contact, null, 2) }] };
    }
    case 'send_whatsapp_order_notification': {
      const { to, customer_name, order_number, notification_type, tracking_number, tracking_url } = args;
      const template = ORDER_TEMPLATES[notification_type];
      if (!template) throw new Error(`Unknown notification type: ${notification_type}`);
      const message = template({ customer_name, order_number, tracking_number, tracking_url });
      const result = await client.sendMessage(to, message);
      return { content: [{ type: 'text', text: `✅ Order notification sent!\nType: ${notification_type}\nTo: ${to}\nSID: ${result.sid}\n\nMessage:\n${message}` }] };
    }
    default: throw new Error(`Unknown WhatsApp tool: ${name}`);
  }
}
