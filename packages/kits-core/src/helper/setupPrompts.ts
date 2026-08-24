import process from 'node:process'
import { cancel, confirm, text } from '@clack/prompts'
import pico from 'picocolors'
import { canSkipEmptying, unwrapPrompt } from '../utils'

export type PromptStep<T extends Record<string, any> = Record<string, any>>
  = (result: PromptResult) => Promise<T>

export interface PromptResult {
  projectName?: string
  packageName?: string
  shouldOverwrite?: boolean
}

type UnionToIntersection<U>
  = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

type InferSteps<T extends PromptStep<any>[]>
  = UnionToIntersection<T[number] extends PromptStep<infer R> ? R : never>

export async function setupPrompts<
  const Steps extends PromptStep<any>[],
>(
  targetDir: string,
  steps: [...Steps],
) {
  const defaultProjectName = targetDir || 'create-starter'

  const result = {
    projectName: defaultProjectName,
    packageName: defaultProjectName,
    shouldOverwrite: false as boolean,
  } as PromptResult & InferSteps<Steps>

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

  for (const step of steps) {
    const extra = await step(result)
    Object.assign(result, extra)
  }

  return {
    result,
    targetDir,
  }
}
