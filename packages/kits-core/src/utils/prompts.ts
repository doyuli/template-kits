import process from 'node:process'
import { cancel, isCancel } from '@clack/prompts'
import pico from 'picocolors'

export async function unwrapPrompt<T>(maybeCancelPromise: Promise<T | symbol>): Promise<T> {
  const result = await maybeCancelPromise

  if (isCancel(result)) {
    cancel(`${pico.red('✖')} 操作取消`)
    process.exit(1)
  }
  return result
}

/**
 * 非 TTY 下 @clack/prompts 的提问永远不会 resolve，进程会静默退出，
 * 因此在真正弹出提问前先检测 stdin，给用户明确的报错而不是无声失败。
 */
export function assertInteractive(usageHint?: string) {
  if (process.stdin.isTTY)
    return

  console.error(pico.red('✖ 当前环境不支持交互式提问（stdin 不是终端）。'))
  console.error(pico.dim(`   请用参数跳过提问，例如：${usageHint ?? 'create-vue my-app --default --force'}`))
  process.exit(1)
}
