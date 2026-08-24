import type { PromptResult } from '@doyuli/kits-core'
import * as fs from 'node:fs'
import * as path from 'node:path'
import process from 'node:process'
import { parseArgs } from 'node:util'
import { intro, outro, spinner, text } from '@clack/prompts'
import {
  getCommand,
  getPackageManager,
  preOrderDirectoryTraverse,
  setupProject,
  setupPrompts,
  setupSelect,
  unwrapPrompt,
} from '@doyuli/kits-core'
import { downloadTemplate } from 'giget'
import pico from 'picocolors'
import { version } from '../package.json'
import { DEFAULT_BANNER } from './constants'
import { resolveStarters } from './starters'

(async function () {
  const cwd = process.cwd()
  const { positionals } = parseArgs({
    strict: true,
    allowPositionals: true,
  })

  intro(pico.magenta(`${DEFAULT_BANNER} v${version}`))

  const inputTargetDir = positionals[0]

  const starters = await resolveStarters()

  const { result, targetDir } = await setupPrompts(inputTargetDir, [
    setupSelect('starter', {
      message: '请选择 Starter：',
      options: starters.map(({ name, tar, description }) => ({
        label: name,
        value: tar,
        hint: description,
      })),
    }),
  ])

  const description = await unwrapPrompt(
    text({
      message: '项目描述：',
      placeholder: '',
      defaultValue: '',
    }),
  )

  const root = await setupProject(cwd, result, targetDir)

  const s = spinner()
  s.start('Starter 下载中...')
  try {
    await downloadTemplate(result.starter, {
      dir: root,
      force: true,
    })
    s.stop('Starter 下载完成')
  }
  catch (error) {
    s.stop('Starter 下载失败')
    console.error(pico.red(`下载失败：${error instanceof Error ? error.message : String(error)}`))
    process.exit(1)
  }

  replacePlaceholders(root, { ...result, description })

  outro(getOutroMessage(root, cwd))
})()

// pkg-placeholder → 项目名，_description_ → 项目描述；仅改文件内容，跳过二进制
function replacePlaceholders(root: string, result: PromptResult & { description: string }) {
  const packageName = result.packageName ?? ''
  const description = result.description

  preOrderDirectoryTraverse(
    root,
    () => {},
    (filepath: string) => {
      if (filepath.includes('node_modules'))
        return

      const content = fs.readFileSync(filepath, 'utf8')
      if (content.includes('\u0000'))
        return

      const replaced = content
        .replaceAll('pkg-placeholder', packageName)
        .replaceAll('_description_', description)

      if (replaced !== content)
        fs.writeFileSync(filepath, replaced)
    },
  )
}

function getOutroMessage(root: string, cwd: string) {
  const manager = getPackageManager()

  let message = `项目初始化完成，可执行以下命令：\n\n`
  if (root !== cwd) {
    const cdProjectName = path.relative(cwd, root)
    message += `   ${pico.bold(pico.green(`cd ${cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName}`))}\n`
  }
  message += `   ${pico.bold(pico.green(getCommand(manager, 'install')))}\n`
  message += `   ${pico.bold(pico.green(getCommand(manager, 'dev')))}\n`

  return message
}
