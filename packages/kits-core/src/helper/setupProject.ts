import type { PromptResult } from './setupPrompts'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { emptyDir, renderFile } from '../utils'

export interface SetupProjectOptions {
  /**
   * 覆盖非空目录时，先把旧目录改名备份、成功后删除，而不是直接清空。
   * 供网络下载等易失败流程使用，失败时可调用 restoreBackup 回滚，避免数据丢失。
   */
  backup?: boolean
}

export interface SetupProjectReturn {
  root: string
  /** backup 模式下，旧目录被改名后的路径（非 backup 模式或无需覆盖时为 undefined） */
  backupPath?: string
}

export async function setupProject(
  cwd: string,
  result: PromptResult,
  targetDir: string,
  options: SetupProjectOptions = {},
): Promise<SetupProjectReturn> {
  const root = path.join(cwd, targetDir)
  let backupPath: string | undefined

  if (fs.existsSync(root) && result.shouldOverwrite) {
    if (options.backup) {
      // 备份旧目录（保留 .git，让回滚后 git 历史仍在）
      backupPath = `${root}.bak-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      fs.renameSync(root, backupPath)
      fs.mkdirSync(root, { recursive: true })
      const gitDir = path.join(backupPath, '.git')
      if (fs.existsSync(gitDir))
        fs.renameSync(gitDir, path.join(root, '.git'))
    }
    else {
      emptyDir(root)
    }
  }
  else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true })
  }

  console.log(`\n正在初始化项目 ${root}...`)

  const pkg = { name: result.packageName, version: '0.0.0' }

  renderFile(root, 'package.json', JSON.stringify(pkg, null, 2))

  return { root, backupPath }
}

/** 回滚：删除新生成的内容，把备份目录还原（.git 一并归位） */
export function restoreBackup(backupPath: string, root: string) {
  const gitDir = path.join(root, '.git')
  if (fs.existsSync(gitDir))
    fs.renameSync(gitDir, path.join(backupPath, '.git'))
  fs.rmSync(root, { recursive: true, force: true })
  fs.renameSync(backupPath, root)
}

/** 流程成功后删除备份目录 */
export function discardBackup(backupPath: string) {
  fs.rmSync(backupPath, { recursive: true, force: true })
}
