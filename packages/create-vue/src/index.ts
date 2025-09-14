import * as fs from 'node:fs'
import * as path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { cancel, confirm, intro, multiselect, outro, text } from '@clack/prompts'
import {
  canSkipEmptying,
  emptyDir,
  getOutroMessage,
  preOrderDirectoryTraverse,
  renderFile,
  renderTemplate,
  unwrapPrompt,
} from '@kits/core'
import ejs from 'ejs'
import pico from 'picocolors'
import {
  DEFAULT_BANNER,
  FEATURE_OPTIONS,
} from './constants'

interface PromptResult {
  projectName?: string
  packageName?: string
  shouldOverwrite?: boolean
  features?: (typeof FEATURE_OPTIONS)[number]['value'][]
}

async function promptUser() {
  const { positionals } = parseArgs({
    strict: true,
    allowPositionals: true,
  })

  let targetDir = positionals[0]

  const defaultProjectName = targetDir || 'Template-Kits'

  const result: PromptResult = {
    projectName: defaultProjectName,
    packageName: defaultProjectName,
    shouldOverwrite: false,
    features: [],
  }

  if (!targetDir) {
    const _result = await unwrapPrompt(
      text({
        message: '请输入项目名称：',
        placeholder: defaultProjectName,
        defaultValue: '',
        validate: value => value.trim().length === 0 ? '不能为空' : '',
      }),
    )
    targetDir = result.projectName = result.packageName = _result.trim()
  }

  if (!canSkipEmptying(targetDir)) {
    result.shouldOverwrite = await unwrapPrompt(
      confirm({
        message: `${
          targetDir === '.'
            ? '当前目录'
            : `目标文件夹 "${targetDir}"`
        } 非空，是否覆盖？`,
        initialValue: false,
      }),
    )

    if (!result.shouldOverwrite) {
      cancel(`${pico.red('✖')} 操作取消`)
      process.exit(0)
    }
  }

  result.features = await unwrapPrompt(
    multiselect({
      message: `请选择要包含的功能： ${pico.dim('(↑/↓ 切换，空格选择，a 全选，回车确认)')}`,
      // @ts-expect-error @clack/prompt's type doesn't support readonly array yet
      options: FEATURE_OPTIONS,
      required: false,
    }),
  )

  return {
    result,
    targetDir,
  }
}

function setupProjectDir(cwd: string, result: PromptResult, targetDir: string) {
  const root = path.join(cwd, targetDir)

  if (fs.existsSync(root) && result.shouldOverwrite) {
    emptyDir(root)
  }
  else if (!fs.existsSync(root)) {
    fs.mkdirSync(root)
  }

  console.log(`\n正在初始化项目 ${root}...`)

  const pkg = { name: result.packageName, version: '0.0.0' }

  renderFile(root, 'tsconfig.json', JSON.stringify(pkg, null, 2))

  return root
}

function renderTemplates(root: string, result: PromptResult) {
  const { features = [] } = result

  const needsAutoRouter = features.includes('unplugin-vue-router')
  const needsGitHooks = features.includes('simple-git-hooks')
  const needsVitest = features.includes('vitest')

  const templateRoot = fileURLToPath(new URL('../template', import.meta.url))
  const callbacks: any[] = []
  const render = (templateName: string) => {
    const templateDir = path.resolve(templateRoot, templateName)
    renderTemplate(templateDir, root, callbacks)
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
        const content = ejs.render(template, {
          needsAutoRouter,
          needsGitHooks,
        })
        fs.writeFileSync(dest, content)
        fs.unlinkSync(filepath)
      }
    },
  )
}

(async function () {
  const cwd = process.cwd()

  intro(pico.magenta(DEFAULT_BANNER))

  const { result, targetDir } = await promptUser()

  const root = setupProjectDir(cwd, result, targetDir)

  renderTemplates(root, result)

  outro(getOutroMessage(root, cwd))
})()
