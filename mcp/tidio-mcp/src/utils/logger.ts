/**
 * Logger - FurMates Tidio MCP
 * All logs go to stderr (stdout is reserved for MCP stdio protocol)
 */

type Level = "info" | "warn" | "error" | "debug";

class Logger {
  constructor(private readonly prefix: string) {}

  private emit(level: Level, message: string, data?: unknown) {
    const entry = JSON.stringify({
      ts: new Date().toISOString(),
      level,
      prefix: this.prefix,
      message,
      ...(data !== undefined ? { data } : {}),
    });
    process.stderr.write(entry + "\n");
  }

  info(msg: string, data?: unknown)  { this.emit("info",  msg, data); }
  warn(msg: string, data?: unknown)  { this.emit("warn",  msg, data); }
  error(msg: string, data?: unknown) { this.emit("error", msg, data); }
  debug(msg: string, data?: unknown) {
    if (process.env.DEBUG) this.emit("debug", msg, data);
  }
}

export const createLogger = (prefix: string) => new Logger(prefix);
