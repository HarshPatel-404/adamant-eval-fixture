/**
 * String and path utility helpers.
 *
 * In v2.0 of this utility, 'sanitizePath' was renamed to 'cleanPath'
 * to avoid naming confusion with filesystem sanitizers.
 */
export function cleanPath(rawPath: string): string {
  // Strips null bytes and control characters, preserving all valid path segments exactly
  return rawPath.replace(/[\0\x08\x0B\x0C\x0E-\x1F]/g, '')
}
