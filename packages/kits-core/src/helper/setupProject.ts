import type { PromptResult } from './setupPrompts'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { emptyDir, renderFile } from '../utils'

export async function setupProject(
  cwd: string,
  result: PromptResult,
  targetDir: string,
) {
  const root = path.join(cwd, targetDir)

  if (fs.existsSync(root) && result.shouldOverwrite) {
    emptyDir(root)
  }
  else if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  console.log(`\n正在初始化项目 ${root}...`)

  const pkg = { name: result.packageName, version: '0.0.0' }

  renderFile(root, 'package.json', JSON.stringify(pkg, null, 2))

  return root
}

// export async function initial() {

// }
