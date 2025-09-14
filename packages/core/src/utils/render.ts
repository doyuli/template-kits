import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export { renderTemplate } from './renderTemplate'

export function renderFile(
  root: string,
  fileName: string,
  content: string,
) {
  writeFileSync(
    resolve(root, fileName),
    content,
    'utf-8',
  )
}
