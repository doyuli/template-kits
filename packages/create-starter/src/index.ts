import type { PromptResult } from '@doyuli/kits-core'
import type { Buffer } from 'node:buffer'
import * as fs from 'node:fs'
import * as path from 'node:path'
import process from 'node:process'
import { log, spinner, text } from '@clack/prompts'
import {
  assertInteractive,
  createCliCommand,
  discardBackup,
  getCommand,
  getPackageManager,
  preOrderDirectoryTraverse,
  restoreBackup,
  runMain,
  setupProject,
  setupPrompts,
  setupSelect,
  unwrapPrompt,
} from '@doyuli/kits-core'
import { downloadTemplate } from 'giget'
import pico from 'picocolors'
import { version } from '../package.json'
import { resolveStarters } from './starters'

const main = createCliCommand({
  name: 'create-starter',
  version,
  description: '从 Starter 模板快速生成项目',
  args: {
    dir: {
      type: 'positional',
      required: false,
      description: '项目目录',
    },
    starter: {
      type: 'string',
      description: 'Starter 名称（与清单中的名称精确匹配，匹配不到则回退到选择）',
    },
    description: {
      type: 'string',
      description: '项目描述',
    },
  },
  run: async ({ args }) => {
    const inputTargetDir = args.dir
    const useDefaults = args.default === true

    const starters = await resolveStarters()

    let starterFromCli: string | undefined
    if (useDefaults) {
      starterFromCli = starters[0]?.tar
    }
    else if (typeof args.starter === 'string') {
      const matched = starters.find(s => s.name === args.starter)
      if (matched) {
        starterFromCli = matched.tar
      }
      else {
        console.warn(pico.yellow(`未找到名为 "${args.starter}" 的 Starter，请手动选择`))
      }
    }

    let descriptionFromCli: string | undefined
    if (useDefaults) {
      descriptionFromCli = starters[0]?.description
    }
    else if (typeof args.description === 'string') {
      descriptionFromCli = args.description
    }

    const { result, targetDir } = await setupPrompts(inputTargetDir, [
      setupSelect('starter', {
        message: '请选择 Starter：',
        options: starters.map(({ name, tar, description }) => ({
          label: name,
          value: tar,
          hint: description,
        })),
        fromCli: starterFromCli,
      }),
    ], { force: args.force === true })

    const description = descriptionFromCli ?? await (async () => {
      assertInteractive('请传入 --description 或使用交互式终端')
      return unwrapPrompt(
        text({
          message: '项目描述：',
          placeholder: '',
          defaultValue: '',
        }),
      )
    })()

    // 备份旧目录：下载成功后再删除备份；失败则回滚，避免网络异常导致旧项目文件丢失
    const { root, backupPath } = await setupProject(process.cwd(), result, targetDir, { backup: true })

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
      if (backupPath) {
        restoreBackup(backupPath, root)
        console.log(pico.yellow(`已恢复原目录内容`))
      }
      console.error(pico.red(`下载失败：${error instanceof Error ? error.message : String(error)}`))
      process.exit(1)
    }

    if (backupPath)
      discardBackup(backupPath)

    replacePlaceholders(root, { ...result, description })

    log.message(getOutroMessage(root, process.cwd()))
  },
})

runMain(main)

// pkg-placeholder → 项目名，_description_ → 项目描述；仅改文件内容，跳过二进制
function replacePlaceholders(root: string, result: PromptResult & { description: string }) {
  const packageName = result.packageName ?? ''
  const description = result.description

  const utf8Decoder = new TextDecoder('utf-8', { fatal: true })
  const isUtf8 = (buffer: Buffer) => {
    try {
      utf8Decoder.decode(buffer)
      return true
    }
    catch {
      return false
    }
  }

  preOrderDirectoryTraverse(
    root,
    () => {},
    (filepath: string) => {
      if (filepath.includes('node_modules'))
        return

      const buffer = fs.readFileSync(filepath)
      // 非 UTF-8 文本（二进制图片等）跳过，避免按文本解码后写回造成损坏
      if (!isUtf8(buffer))
        return

      const content = buffer.toString('utf8')
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
