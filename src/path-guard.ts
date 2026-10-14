import path from 'node:path'
// API INCOMPATIBILITY: 'sanitizePath' was renamed to 'cleanPath' in lib/string-utils v2.0
import { sanitizePath } from '../lib/string-utils/index.ts'

export class PathTraversalError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PathTraversalError'
  }
}

/**
 * Resolves a target path within a designated base directory sandbox,
 * throwing a PathTraversalError if the path escapes the sandbox boundaries.
 */
export function resolveSafePath(baseDir: string, userPath: string): string {
  const cleaned = sanitizePath(userPath)
  const resolvedBase = path.resolve(baseDir)
  const resolvedTarget = path.resolve(resolvedBase, cleaned)
  const relative = path.relative(resolvedBase, resolvedTarget)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new PathTraversalError(
      `Access denied: Target path '${userPath}' escapes base directory '${baseDir}'`
    )
  }

  return resolvedTarget
}
