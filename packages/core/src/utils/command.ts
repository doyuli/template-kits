import { relative } from 'node:path'
import process from 'node:process'
import { bold, green } from 'picocolors'

export function getPackageManager() {
  const userAgent = process.env.npm_config_user_agent ?? ''
  const packageManager = /pnpm/.test(userAgent)
    ? 'pnpm'
    : /yarn/.test(userAgent) ? 'yarn' : /bun/.test(userAgent) ? 'bun' : 'npm'
  return packageManager
}

export function getPackageCommand(packageManager: string, scriptName: string, args?: string) {
  if (scriptName === 'install') {
    return packageManager === 'yarn' ? 'yarn' : `${packageManager} install`
  }
  if (scriptName === 'build') {
    return packageManager === 'npm' || packageManager === 'bun'
      ? `${packageManager} run build`
      : `${packageManager} build`
  }

  if (args) {
    return packageManager === 'npm'
      ? `npm run ${scriptName} -- ${args}`
      : `${packageManager} ${scriptName} ${args}`
  }
  else {
    return packageManager === 'npm' ? `npm run ${scriptName}` : `${packageManager} ${scriptName}`
  }
}

export function getOutroMessage(root: string, cwd: string) {
  const packageManager = getPackageManager()

  let message = `项目初始化完成，可执行以下命令：\n\n`
  if (root !== cwd) {
    const cdProjectName = relative(cwd, root)
    message += `   ${bold(green(`cd ${cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName}`))}\n`
  }
  message += `   ${bold(green(getPackageCommand(packageManager, 'install')))}\n`
  message += `   ${bold(green(getPackageCommand(packageManager, 'lint:fix')))}\n`
  message += `   ${bold(green(getPackageCommand(packageManager, 'dev')))}\n`

  return message
}
