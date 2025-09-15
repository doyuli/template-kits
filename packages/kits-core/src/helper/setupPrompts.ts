import type { Option } from '@clack/prompts'
import process from 'node:process'
import { cancel, confirm, multiselect, text } from '@clack/prompts'
import pico from 'picocolors'
import { canSkipEmptying, unwrapPrompt } from '../utils'

export interface PromptResult<T = string> {
  projectName?: string
  packageName?: string
  shouldOverwrite?: boolean
  features?: T[]
}

export async function setupPrompts<T = string>(
  targetDir: string,
  featureOptions: ReadonlyArray<Option<T>>,
) {
  const defaultProjectName = targetDir || 'Template-Kits'

  const result: PromptResult<T> = {
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
      options: featureOptions,
      required: false,
    }),
  )

  return {
    result,
    targetDir,
  }
}
