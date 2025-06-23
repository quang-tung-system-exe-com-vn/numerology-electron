import path from 'node:path'
import { app } from 'electron'

/**
 * Returns the correct path to a resource file in the public directory,
 * handling differences between development and packaged environments.
 * @param fileName The name of the file in the public directory.
 * @returns The absolute path to the resource file.
 */
export function getResourcePath(fileName: string): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'public', fileName)
  }
  return path.join(app.getAppPath(), 'src/resources/public', fileName)
}
