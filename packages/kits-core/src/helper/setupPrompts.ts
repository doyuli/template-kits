import process from 'node:process'
import { cancel, confirm, text } from '@clack/prompts'
import pico from 'picocolors'
import { assertInteractive, canSkipEmptying, toSafePackageName, unwrapPrompt } from '../utils'

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

export interface SetupPromptsOptions {
  /** 非空目录确认覆盖时，不再提问直接覆盖（对应 --force） */
  force?: boolean
}

export async function setupPrompts<
  const Steps extends PromptStep<any>[],
>(
  targetDir: string,
  steps: [...Steps],
  options: SetupPromptsOptions = {},
) {
  const defaultProjectName = targetDir || 'create-starter'

  const result = {
    projectName: defaultProjectName,
    packageName: toSafePackageName(defaultProjectName),
    shouldOverwrite: false as boolean,
  } as PromptResult & InferSteps<Steps>

  if (!targetDir) {
    assertInteractive('请直接传入项目名，如：create-vue my-app')
    const _result = await unwrapPrompt(
      text({
        message: '请输入项目名称：',
        placeholder: defaultProjectName,
        defaultValue: '',
        validate: value => value.trim().length === 0 ? '不能为空' : undefined,
      }),
    )
    targetDir = result.projectName = _result.trim()
    // 目录名不做转换，但 package.json 的 name 必须是合法 npm 包名
    result.packageName = toSafePackageName(result.projectName)
  }

  if (!canSkipEmptying(targetDir)) {
    if (!options.force)
      assertInteractive(`目录非空，需确认是否覆盖：create-vue ${targetDir} --force`)

    result.shouldOverwrite = options.force || await unwrapPrompt(
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
      process.exit(1)
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
