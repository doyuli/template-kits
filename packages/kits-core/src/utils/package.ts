import process from 'node:process'

export function getPackageManager() {
  const userAgent = process.env.npm_config_user_agent ?? ''
  return /pnpm/.test(userAgent)
    ? 'pnpm'
    : /yarn/.test(userAgent)
      ? 'yarn'
      : /bun/.test(userAgent)
        ? 'bun'
        : 'npm'
}

export function getCommand(manager: string, name: string, args?: string) {
  if (name === 'install') {
    return manager === 'yarn' ? 'yarn' : `${manager} install`
  }
  if (name === 'build') {
    return manager === 'npm' || manager === 'bun'
      ? `${manager} run build`
      : `${manager} build`
  }

  if (args) {
    return manager === 'npm'
      ? `npm run ${name} -- ${args}`
      : `${manager} ${name} ${args}`
  }
  else {
    return manager === 'npm' ? `npm run ${name}` : `${manager} ${name}`
  }
}
