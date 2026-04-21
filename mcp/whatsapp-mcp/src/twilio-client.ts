export class TwilioWhatsAppClient {
  private baseUrl;
  private auth;
  private config;

  constructor(config) {
    this.config = config;
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}`;
    this.auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64');
  }

  get headers() {
    return { Authorization: `Basic ${this.auth}`, 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' };
  }

  toWhatsApp(number) {
    if (number.startsWith('whatsapp:')) return number;
    return `whatsapp:${number.startsWith('+') ? number : '+' + number}`;
  }

  async sendMessage(to, body, mediaUrl) {
    const params = new URLSearchParams({ To: this.toWhatsApp(to), From: this.config.fromNumber, Body: body });
    if (mediaUrl) params.set('MediaUrl', mediaUrl);
    const res = await fetch(`${this.baseUrl}/Messages.json`, { method: 'POST', headers: this.headers, body: params.toString() });
    if (!res.ok) { const err = await res.json().catch(() => ({ message: res.statusText })); throw new Error(`Twilio ${res.status}: ${err.message}`); }
    return res.json();
  }

  async getMessages(params = {}) {
    const q = new URLSearchParams();
    if (params.to) q.set('To', this.toWhatsApp(params.to));
    if (params.from) q.set('From', this.toWhatsApp(params.from));
    if (params.limit) q.set('PageSize', String(Math.min(params.limit, 100)));
    if (params.dateSentAfter) q.set('DateSent>', params.dateSentAfter);
    q.set('To', q.get('To') || 'whatsapp:');
    const res = await fetch(`${this.baseUrl}/Messages.json?${q.toString()}`, { headers: { ...this.headers, 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error(`Twilio ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return data.messages.filter(m => m.to?.startsWith('whatsapp:') || m.from?.startsWith('whatsapp:'));
  }

  async getMessage(sid) {
    const res = await fetch(`${this.baseUrl}/Messages/${sid}.json`, { headers: { ...this.headers, 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error(`Twilio ${res.status}: ${res.statusText}`);
    return res.json();
  }

  async markRead(sid) {
    const res = await fetch(`${this.baseUrl}/Messages/${sid}.json`, { method: 'POST', headers: this.headers, body: new URLSearchParams({ Status: 'read' }).toString() });
    if (!res.ok) throw new Error(`Twilio ${res.status}: ${res.statusText}`);
    return res.json();
  }

  async getContact(phone) {
    const wa = this.toWhatsApp(phone);
    const messages = await this.getMessages({ to: phone, limit: 50 });
    const inbound = messages.filter(m => m.from === wa);
    const outbound = messages.filter(m => m.to === wa);
    const all = [...inbound, ...outbound].sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
    return { phone, whatsapp_address: wa, message_count: all.length, last_message_at: all[0]?.date_created ?? null, messages: all.slice(0, 10) };
  }
}

export function createTwilioClientFromEnv() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    throw new Error('Missing env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM (e.g. whatsapp:+14155238886)');
  }
  return new TwilioWhatsAppClient({ accountSid: TWILIO_ACCOUNT_SID, authToken: TWIMIO_AUTH_TOKEN, fromNumber: TWILIO_WHATSAPP_FROM });
}
