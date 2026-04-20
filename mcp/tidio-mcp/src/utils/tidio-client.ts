/**
 * Tidio OpenAPI Client
 * FurMates Automation - tidio-mcp
 *
 * Auth: X-Tidio-Openapi-Client-Id + X-Tidio-Openapi-Client-Secret headers
 * Base URL: https://api.tidio.com
 * API Version: Accept: application/json; version=1
 *
 * Docs: https://developers.tidio.com/docs/openapi-authorization
 */

export interface TidioConfig {
  clientId: string;     // prefixed with ci_
  clientSecret: string; // prefixed with cs_
  apiVersion?: string;  // default: "1"
}

export interface TidioRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

export class TidioClient {
  private config: TidioConfig;
  private baseUrl = "https://api.tidio.com";

  constructor(config: TidioConfig) {
    this.config = config;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  async request<T>(endpoint: string, options: TidioRequestOptions = {}): Promise<T> {
    const { method = "GET", body, params } = options;
    const url = this.buildUrl(endpoint, params);
    const version = this.config.apiVersion ?? "1";

    const headers: Record<string, string> = {
      "X-Tidio-Openapi-Client-Id": this.config.clientId,
      "X-Tidio-Openapi-Client-Secret": this.config.clientSecret,
      "Accept": `application/json; version=${version}`,
      "Content-Type": "application/json",
    };

    let retries = 3;
    while (retries > 0) {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") ?? "5";
        console.error(`[TidioClient] Rate limited – retrying after ${retryAfter}s`);
        await sleep(parseFloat(retryAfter) * 1000);
        retries--;
        continue;
      }

      if (response.status === 204) return {} as T; // No content

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        throw new Error(`Tidio API ${response.status}: ${errBody}`);
      }

      return response.json() as Promise<T>;
    }

    throw new Error("Request failed after retries");
  }

  // ─── Conversations ────────────────────────────────────────────────────

  async listConversations(params: {
    status?: "open" | "solved" | "pending";
    page?: number;
    limit?: number;
    assignee_id?: string;
  } = {}): Promise<TidioConversationList> {
    return this.request("/conversations", { params: params as any });
  }

  async getConversation(id: string): Promise<TidioConversation> {
    return this.request(`/conversations/${id}`);
  }

  async updateConversation(id: string, data: {
    status?: "open" | "solved" | "pending";
    assignee_id?: string | null;
  }): Promise<TidioConversation> {
    return this.request(`/conversations/${id}`, { method: "PATCH", body: data });
  }

  async closeConversation(id: string): Promise<TidioConversation> {
    return this.updateConversation(id, { status: "solved" });
  }

  async assignConversation(id: string, operatorId: string): Promise<TidioConversation> {
    return this.updateConversation(id, { assignee_id: operatorId });
  }

  async unassignConversation(id: string): Promise<TidioConversation> {
    return this.updateConversation(id, { assignee_id: null });
  }

  // ─── Messages ─────────────────────────────────────────────────────────

  async listMessages(conversationId: string, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<TidioMessageList> {
    return this.request(`/conversations/${conversationId}/messages`, { params: params as any });
  }

  async sendMessage(conversationId: string, data: {
    message: string;
    type?: "message" | "note"; // note = internal, message = visible to customer
    author_type?: "operator";
  }): Promise<TidioMessage> {
    return this.request(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: {
        message: data.message,
        type: data.type ?? "message",
        author_type: data.author_type ?? "operator",
      },
    });
  }

  // ─── Contacts ─────────────────────────────────────────────────────────

  async listContacts(params: {
    page?: number;
    limit?: number;
    email?: string;
  } = {}): Promise<TidioContactList> {
    return this.request("/contacts", { params: params as any });
  }

  async getContact(id: string): Promise<TidioContact> {
    return this.request(`/contacts/${id}`);
  }

  async updateContact(id: string, data: Partial<TidioContactUpdate>): Promise<TidioContact> {
    return this.request(`/contacts/${id}`, { method: "PATCH", body: data });
  }

  async getContactConversations(contactId: string, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<TidioConversationList> {
    return this.request(`/contacts/${contactId}/conversations`, { params: params as any });
  }

  async searchContacts(query: string): Promise<TidioContactList> {
    return this.request("/contacts", { params: { search: query } });
  }

  // ─── Operators ────────────────────────────────────────────────────────

  async listOperators(): Promise<TidioOperatorList> {
    return this.request("/operators");
  }
}

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface TidioConversationList {
  data: TidioConversation[];
  meta?: { total: number; page: number; limit: number };
}

export interface TidioConversation {
  id: string;
  status: "open" | "solved" | "pending";
  created_at: string;
  updated_at: string;
  assignee?: TidioOperatorRef | null;
  contact?: TidioContactRef;
  channel: string;            // "live_chat" | "email" | "messenger" etc.
  unread_messages_count: number;
  last_message?: TidioMessagePreview;
  tags?: string[];
}

export interface TidioMessagePreview {
  message: string;
  created_at: string;
  author_type: "visitor" | "operator" | "bot";
}

export interface TidioMessageList {
  data: TidioMessage[];
  meta?: { total: number; page: number; limit: number };
}

export interface TidioMessage {
  id: string;
  conversation_id: string;
  message: string;
  type: "message" | "note" | "system";
  author_type: "visitor" | "operator" | "bot";
  author?: TidioOperatorRef | TidioContactRef;
  created_at: string;
  seen_at?: string | null;
}

export interface TidioContactList {
  data: TidioContact[];
  meta?: { total: number; page: number; limit: number };
}

export interface TidioContact {
  id: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  custom_properties?: Record<string, string | number | boolean>;
  tags?: string[];
  created_at: string;
  updated_at: string;
  conversations_count?: number;
}

export interface TidioContactUpdate {
  email: string;
  name: string;
  phone: string;
  custom_properties: Record<string, string | number | boolean>;
  tags: string[];
}

export interface TidioOperatorList {
  data: TidioOperator[];
}

export interface TidioOperator {
  id: string;
  name: string;
  email: string;
  status: "online" | "offline" | "away";
  role: "owner" | "admin" | "agent";
}

export interface TidioOperatorRef {
  id: string;
  name?: string;
}

export interface TidioContactRef {
  id: string;
  name?: string;
  email?: string;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createTidioClientFromEnv(): TidioClient {
  const clientId = process.env.TIDIO_CLIENT_ID;
  const clientSecret = process.env.TIDIO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing required env vars: TIDIO_CLIENT_ID (ci_...), TIDIO_CLIENT_SECRET (cs_...)"
    );
  }

  return new TidioClient({ clientId, clientSecret });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
