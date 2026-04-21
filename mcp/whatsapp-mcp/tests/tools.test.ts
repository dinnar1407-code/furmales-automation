/**
 * FurMates WhatsApp MCP — Test Suite
 */
import { TwilioWhatsAppClient } from '../src/twilio-client';
import { handleWhatsAppTool } from '../src/tools';

const mockMessage = {
  sid: 'SM1234567890abcdef',
  body: 'Hello from FurMates!',
  from: 'whatsapp:+14155238886',
  to: 'whatsapp:+15551234567',
  status: 'delivered',
  direction: 'outbound-api' as const,
  date_created: '2026-04-21T09:00:00Z',
  date_sent: '2026-04-21T09:00:01Z',
  price: '-0.005',
  error_code: null,
  error_message: null,
  num_media: '0',
};

function createMockClient(): jest.Mocked<TwilioWhatsAppClient> {
  return {
    sendMessage: jest.fn().mockResolvedValue(mockMessage),
    getMessages: jest.fn().mockResolvedValue([mockMessage]),
    getMessage: jest.fn().mockResolvedValue(mockMessage),
    markRead: jest.fn().mockResolvedValue({ ...mockMessage, status: 'read' }),
    getContact: jest.fn().mockResolvedValue({
      phone: '+15551234567',
      whatsapp_address: 'whatsapp:+15551234567',
      message_count: 1,
      last_message_at: '2026-04-21T09:00:00Z',
      messages: [mockMessage],
    }),
  } as unknown as jest.Mocked<TwilioWhatsAppClient>;
}

describe('WhatsApp Tools', () => {
  let client: jest.Mocked<TwilioWhatsAppClient>;
  beforeEach(() => { client = createMockClient(); });

  test('send_whatsapp_message sends and confirms', async () => {
    const result = await handleWhatsAppTool('send_whatsapp_message', {
      to: '+15551234567',
      message: 'Hello from FurMates! 🐾',
    }, client);
    expect(client.sendMessage).toHaveBeenCalledWith('+15551234567', 'Hello from FurMates! 🐾', undefined);
    expect(result.content[0].text).toContain('✅ WhatsApp message sent');
    expect(result.content[0].text).toContain('SM1234567890abcdef');
  });

  test('send_whatsapp_message with media URL', async () => {
    await handleWhatsAppTool('send_whatsapp_message', {
      to: '+15551234567',
      message: 'Check out this product!',
      media_url: 'https://furmales.com/product.jpg',
    }, client);
    expect(client.sendMessage).toHaveBeenCalledWith('+15551234567', 'Check out this product!', 'https://furmales.com/product.jpg');
  });

  test('get_whatsapp_messages returns list', async () => {
    const result = await handleWhatsAppTool('get_whatsapp_messages', { limit: 20 }, client);
    expect(client.getMessages).toHaveBeenCalledWith({ to: undefined, from: undefined, limit: 20, dateSentAfter: undefined });
    expect(result.content[0].text).toContain('SM1234567890abcdef');
  });

  test('mark_whatsapp_read updates status', async () => {
    const result = await handleWhatsAppTool('mark_whatsapp_read', {
      message_sid: 'SM1234567890abcdef',
    }, client);
    expect(client.markRead).toHaveBeenCalledWith('SM1234567890abcdef');
    expect(result.content[0].text).toContain('marked as read');
  });

  test('get_whatsapp_contact returns contact info', async () => {
    const result = await handleWhatsAppTool('get_whatsapp_contact', { phone: '+15551234567' }, client);
    expect(client.getContact).toHaveBeenCalledWith('+15551234567');
    expect(result.content[0].text).toContain('whatsapp:+15551234567');
  });

  test('send_whatsapp_order_notification — order_confirmed', async () => {
    const result = await handleWhatsAppTool('send_whatsapp_order_notification', {
      to: '+15551234567',
      customer_name: 'Jane',
      order_number: '#1001',
      notification_type: 'order_confirmed',
    }, client);
    expect(client.sendMessage).toHaveBeenCalled();
    expect(result.content[0].text).toContain('order_confirmed');
    expect(result.content[0].text).toContain('Jane');
  });

  test('send_whatsapp_order_notification — order_shipped with tracking', async () => {
    const result = await handleWhatsAppTool('send_whatsapp_order_notification', {
      to: '+15551234567',
      customer_name: 'Jane',
      order_number: '#1001',
      notification_type: 'order_shipped',
      tracking_number: '1Z999AA10123456784',
      tracking_url: 'https://track.usps.com/1Z999AA10123456784',
    }, client);
    const call = (client.sendMessage as jest.Mock).mock.calls[0];
    expect(call[1]).toContain('1Z999AA10123456784');
    expect(call[1]).toContain('track.usps.com');
  });

  test('unknown tool throws error', async () => {
    await expect(handleWhatsAppTool('unknown_tool', {}, client)).rejects.toThrow('Unknown WhatsApp tool');
  });
});
