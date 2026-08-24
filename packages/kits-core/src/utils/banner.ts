import pico from 'picocolors'

export const DEFAULT_TAGLINE = '快速生成你的项目'

/** 渐变色：海青 → 紫罗兰 */
const GRADIENT_START = [0x22, 0xD3, 0xEE]
const GRADIENT_END = [0xA7, 0x8B, 0xFA]

function lerpChannel(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t)
}

/**
 * 单行渐变 banner：品牌名逐字符着色（支持时），无框线。
 *
 * 形如：`create-lib v0.2.4 · 快速生成你的项目`
 * 非 TTY / 管道（isColorSupported === false）时返回纯文本，不输出任何 ANSI 序列。
 */
export function renderBanner(input: {
  name: string
  version?: string
  tagline?: string
}): string {
  const { name, version, tagline = DEFAULT_TAGLINE } = input

  const coloredName = pico.isColorSupported
    ? gradientText(name)
    : name

  const parts = [coloredName]
  if (version)
    parts.push(pico.dim(`v${version}`))
  parts.push(pico.gray('·'), tagline)

  return parts.join(' ')
}

function gradientText(text: string) {
  if (text.length === 0)
    return ''

  const chars = [...text]
  const colored = chars.map((char, i) => {
    const t = chars.length === 1 ? 1 : i / (chars.length - 1)
    const r = lerpChannel(GRADIENT_START[0], GRADIENT_END[0], t)
    const g = lerpChannel(GRADIENT_START[1], GRADIENT_END[1], t)
    const b = lerpChannel(GRADIENT_START[2], GRADIENT_END[2], t)
    return `\x1B[38;2;${r};${g};${b}m${char}`
  })

  return `${colored.join('')}\x1B[0m`
}
