/**
 * Logger utility for FurMates Shopify MCP
 */

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  private log(level: LogLevel, message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      level,
      prefix: this.prefix,
      message,
      ...(data !== undefined ? { data } : {}),
    };
    const output = JSON.stringify(entry);
    if (level === "error") {
      process.stderr.write(output + "\n");
    } else {
      process.stderr.write(output + "\n"); // MCP uses stdout for protocol, stderr for logs
    }
  }

  info(message: string, data?: unknown) {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown) {
    this.log("warn", message, data);
  }

  error(message: string, data?: unknown) {
    this.log("error", message, data);
  }

  debug(message: string, data?: unknown) {
    if (process.env.DEBUG) {
      this.log("debug", message, data);
    }
  }
}

export function createLogger(prefix: string) {
  return new Logger(prefix);
}
