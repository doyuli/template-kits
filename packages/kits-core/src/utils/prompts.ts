import process from 'node:process'
import { cancel, isCancel } from '@clack/prompts'
import pico from 'picocolors'

export async function unwrapPrompt<T>(maybeCancelPromise: Promise<T | symbol>): Promise<T> {
  const result = await maybeCancelPromise

  if (isCancel(result)) {
    cancel(`${pico.red('✖')} 操作取消`)
    process.exit(0)
  }
  return result
}
