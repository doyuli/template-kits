import type {
  PromptResult,
} from '@doyuli/kits-core'
import * as fs from 'node:fs'
import * as path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { log } from '@clack/prompts'
import {
  createCliCommand,
  getCommand,
  getPackageManager,
  parseCsvFlags,
  preOrderDirectoryTraverse,
  renderFile,
  renderTemplate,
  runMain,
  setupFeatures,
  setupProject,
  setupPrompts,
  setupSelect,
} from '@doyuli/kits-core'
import ejs from 'ejs'
import pico from 'picocolors'
import { version } from '../package.json'
import {
  CSS_FRAMEWORK_OPTIONS,
  FEATURE_OPTIONS,
} from './constants'

const FEATURE_VALUES = FEATURE_OPTIONS.map(o => o.value) as readonly string[]
const CSS_VALUES = CSS_FRAMEWORK_OPTIONS.map(o => o.value) as readonly string[]
const DEFAULT_CSS = 'unocss' as const

const main = createCliCommand({
  name: 'create-vue',
  version,
  description: '快速生成 Vue 3 项目模板',
  args: {
    dir: {
      type: 'positional',
      required: false,
      description: '项目目录',
    },
    features: {
      type: 'string',
      description: `要包含的功能（可选：${FEATURE_VALUES.join(', ')}）`,
    },
    css: {
      type: 'enum',
      options: [...CSS_VALUES],
      description: `CSS 框架（可选：${CSS_VALUES.join(' / ')}）`,
    },
  },
  run: async ({ args }) => {
    const inputTargetDir = args.dir
    const useDefaults = args.default === true

    let featuresFromCli: string[] | undefined
    if (useDefaults) {
      featuresFromCli = []
    }
    else if (typeof args.features === 'string') {
      featuresFromCli = parseCsvFlags(args.features, FEATURE_VALUES, 'features')
    }

    const cssFromCli = useDefaults
      ? DEFAULT_CSS
      : (typeof args.css === 'string' ? args.css : undefined)

    const { result, targetDir } = await setupPrompts(inputTargetDir, [
      setupFeatures('features', {
        options: [...FEATURE_OPTIONS],
        fromCli: featuresFromCli as (typeof FEATURE_OPTIONS[number]['value'])[] | undefined,
      }),
      setupSelect('cssFramework', {
        message: '请选择 CSS 框架：',
        options: [...CSS_FRAMEWORK_OPTIONS],
        fromCli: cssFromCli as (typeof CSS_FRAMEWORK_OPTIONS[number]['value']) | undefined,
      }),
    ], { force: args.force === true })

    const { root } = await setupProject(process.cwd(), result, targetDir)

    renderTemplates(root, result)

    log.message(getOutroMessage(root, process.cwd()))
  },
})

runMain(main)

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

function renderTemplates(root: string, result: PromptResult & { features: string[], cssFramework: string }) {
  const { features, cssFramework } = result

  const needsAutoRouter = features.includes('file-routing')
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

  render(needsAutoRouter ? 'router/file-routing' : 'router/default')

  if (needsGitHooks) {
    render('git-hooks')
  }

  render(cssFramework === 'tailwindcss' ? 'css/tailwindcss' : 'css/unocss')

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
