import type {
  PromptResult,
} from '@doyuli/kits-core'
import * as path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { intro, outro } from '@clack/prompts'
import {
  getCommand,
  getPackageManager,
  renderTemplate,
  setupFeatures,
  setupProject,
  setupPrompts,
} from '@doyuli/kits-core'
import pico from 'picocolors'
import {
  DEFAULT_BANNER,
  FEATURE_OPTIONS,
} from './constants'
import { renderMonorepoDeps } from './helper';

(async function () {
  const cwd = process.cwd()
  const { positionals } = parseArgs({
    strict: true,
    allowPositionals: true,
  })

  intro(pico.magenta(DEFAULT_BANNER))

  const inputTargetDir = positionals[0]

  const { result, targetDir } = await setupPrompts(inputTargetDir, [
    setupFeatures('features', {
      options: [...FEATURE_OPTIONS],
    }),
  ])

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
