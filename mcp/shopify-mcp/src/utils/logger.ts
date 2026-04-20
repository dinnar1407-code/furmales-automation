/**
 * Logger utility for FurMates Shopify MCP
 */
type LogLevel = "info" | "warn" | "error" | "debug";
class Logger {
  private prefix: string;
  constructor(prefix: string) { this.prefix = prefix; }
  private log(level: LogLevel, message: string, data?: unknown) {
    process.stderr.write(JSON.stringify({ts:new Date().toISOString(),level,prefix:this.prefix,message,...(data?{data}:{})})+"\n");
  }
  info(m:string,d?:unknown){this.log("info",m,d);}
  error(m:string,d?:unknown){this.log("error",m,d);}
  warn(m:string,d?:unknown){this.log("warn",m,d);}
  debug(m:string,d?:unknown){if(process.env.DEBUG)this.log("debug",m,d);}
}
export function createLogger(prefix:string){return new Logger(prefix);}
