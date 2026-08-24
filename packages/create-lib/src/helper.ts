import * as fs from 'node:fs'
import * as path from 'node:path'
import { renderFile } from '@doyuli/kits-core'

/**
 * Convert devDependencies to catalog: references and generate pnpm-workspace.yaml
 */
export function renderMonorepoDeps(root: string) {
  const pkgPath = path.join(root, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const devDeps: Record<string, string> = pkg.devDependencies ?? {}

  const sortedEntries = Object.entries(devDeps).sort(([a], [b]) => a.localeCompare(b))
  const catalogDeps = Object.fromEntries(sortedEntries.map(([k]) => [k, 'catalog:']))

  pkg.devDependencies = catalogDeps
  renderFile(root, 'package.json', `${JSON.stringify(pkg, null, 2)}\n`)

  const catalogLines = sortedEntries
    .map(([name, version]) => {
      const key = name.includes('/') ? `'${name}'` : name
      return `  ${key}: ${version}`
    })
    .join('\n')

  const workspace = [
    'shellEmulator: true',
    'trustPolicy: no-downgrade',
    '',
    'packages:',
    '  - packages/*',
    '',
    'catalog:',
    catalogLines,
    '',
  ].join('\n')

  renderFile(root, 'pnpm-workspace.yaml', workspace)
}
