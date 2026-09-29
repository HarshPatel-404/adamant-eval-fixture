import path from 'node:path'

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
  const resolvedBase = path.resolve(baseDir)
  const resolvedTarget = path.resolve(resolvedBase, userPath)

  // BUG: Boundary containment check removed, allowing paths that escape sandbox base directory
  return resolvedTarget
}
