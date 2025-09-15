import type {
  PromptResult,
} from '@doyuli/kits-core'
import * as fs from 'node:fs'
import * as path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { intro, outro } from '@clack/prompts'
import {
  getCommand,
  getPackageManager,
  preOrderDirectoryTraverse,
  renderFile,
  renderTemplate,
  setupProject,
  setupPrompts,
} from '@doyuli/kits-core'
import ejs from 'ejs'
import pico from 'picocolors'
import {
  DEFAULT_BANNER,
  FEATURE_OPTIONS,
} from './constants'

(async function () {
  const cwd = process.cwd()
  const { positionals } = parseArgs({
    strict: true,
    allowPositionals: true,
  })

  intro(pico.magenta(DEFAULT_BANNER))

  const { result, targetDir } = await setupPrompts(positionals[0], FEATURE_OPTIONS)

  const root = await setupProject(cwd, result, targetDir)

  renderTemplates(root, result)

  outro(getOutroMessage(root, cwd))
})()

function getOutroMessage(root: string, cwd: string) {
  const manager = getPackageManager()

  let message = `项目初始化完成，可执行以下命令：\n\n`
  if (root !== cwd) {
    const cdProjectName = path.relative(cwd, root)
    message += `   ${pico.bold(pico.green(`cd ${cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName}`))}\n`
  }
  message += `   ${pico.bold(pico.green(getCommand(manager, 'install')))}\n`
  message += `   ${pico.bold(pico.green(getCommand(manager, 'lint:fix')))}\n`
  message += `   ${pico.bold(pico.green(getCommand(manager, 'dev')))}\n`

  return message
}

function renderTemplates(root: string, result: PromptResult) {
  const { features = [] } = result

  const needsAutoRouter = features.includes('unplugin-vue-router')
  const needsGitHooks = features.includes('simple-git-hooks')
  const needsVitest = features.includes('vitest')

  const templateRoot = fileURLToPath(new URL('../template', import.meta.url))
  const render = (templateName: string) => {
    const templateDir = path.resolve(templateRoot, templateName)
    renderTemplate(templateDir, root)
  }

  render('base')
  render('eslint')
  render('tsconfig')

  render(needsAutoRouter ? 'router/unplugin' : 'router/default')

  if (needsGitHooks) {
    render('git-hooks')
  }

  const rootTsConfig = {
    files: [],
    references: [
      {
        path: './tsconfig.node.json',
      },
      {
        path: './tsconfig.app.json',
      },
    ],
  }

  if (needsVitest) {
    render('vitest')
    rootTsConfig.references.push({ path: './tsconfig.vitest.json' })
  }

  renderFile(root, 'tsconfig.json', `${JSON.stringify(rootTsConfig, null, 2)}\n`)
  renderFile(root, '.env', `VITE_APP_TITLE = ${result.packageName}\n`)

  //  EJS template rendering
  preOrderDirectoryTraverse(
    root,
    () => {},
    (filepath: string) => {
      if (filepath.endsWith('.ejs')) {
        const template = fs.readFileSync(filepath, 'utf-8')
        const dest = filepath.replace(/\.ejs$/, '')
        const content = ejs.render(template, result)
        fs.writeFileSync(dest, content)
        fs.unlinkSync(filepath)
      }
    },
  )
}
