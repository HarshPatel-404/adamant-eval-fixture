/**
 * Application environment configuration types and parser.
 */

export interface ServerConfig {
  readonly host: string
  readonly port: number
  readonly timeoutMs: number
}

export const defaultServerConfig: ServerConfig = {
  host: '127.0.0.1',
  port: 8080,
  timeoutMs: 5000,
}

export function parsePort(value: string | undefined): number {
  if (!value) return defaultServerConfig.port
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid port: ${value}`)
  }
  return parsed
}
