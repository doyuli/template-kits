import type {
  PromptResult,
} from '@doyuli/kits-core'
import * as path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { log } from '@clack/prompts'
import {
  createCliCommand,
  getCommand,
  getPackageManager,
  parseCsvFlags,
  renderTemplate,
  runMain,
  setupFeatures,
  setupProject,
  setupPrompts,
} from '@doyuli/kits-core'
import pico from 'picocolors'
import { version } from '../package.json'
import {
  FEATURE_OPTIONS,
} from './constants'
import { renderMonorepoDeps } from './helper'

const FEATURE_VALUES = FEATURE_OPTIONS.map(o => o.value) as readonly string[]

const main = createCliCommand({
  name: 'create-lib',
  version,
  description: '快速生成 TypeScript Library 项目模板',
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

    const { result, targetDir } = await setupPrompts(inputTargetDir, [
      setupFeatures('features', {
        options: [...FEATURE_OPTIONS],
        fromCli: featuresFromCli as (typeof FEATURE_OPTIONS[number]['value'])[] | undefined,
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
  message += `   ${pico.bold(pico.green(getCommand(manager, 'dev')))}\n`

  return message
}

function renderTemplates(root: string, result: PromptResult & { features: string[] }) {
  const { features } = result

  const needsMonorepo = features.includes('monorepo')
  const needsGitHooks = features.includes('simple-git-hooks')
  const needsWorkflows = features.includes('github-workflows')

  const templateRoot = fileURLToPath(new URL('../template', import.meta.url))
  const render = (templateName: string) => {
    const templateDir = path.resolve(templateRoot, templateName)
    renderTemplate(templateDir, root)
  }

  render('base')
  render('eslint')

  if (needsGitHooks) {
    render('git-hooks')
  }

  if (needsWorkflows) {
    render('github-workflows')
  }

  if (needsMonorepo) {
    render('monorepo')
    renderMonorepoDeps(root)
  }
  else {
    render('single-repo')
  }
}
