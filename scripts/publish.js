import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import process from 'node:process'
import { parseArgs } from 'node:util'
import { cancel, confirm, isCancel } from '@clack/prompts'
import pico from 'picocolors'
import semver from 'semver'

const validTypes = new Set(['major', 'minor', 'patch', 'beta'])

function logError(msg) {
  console.error(pico.red(msg))
  process.exit(1)
}

(async function () {
  const cwd = process.cwd()

  const { positionals } = parseArgs({
    strict: true,
    allowPositionals: true,
  })

  const publishType = positionals[0] || 'patch'

  if (!validTypes.has(publishType)) {
    logError(`Invalid release type: ${publishType}. Expected one of: ${[...validTypes].join(', ')}`)
  }

  const rootPackage = getCurrenPackage(cwd)
  const nextVersion = getNextVersion(rootPackage.version, publishType)

  const shouldUpdate = await confirm({
    message: `即将发布:  ${pico.bold(nextVersion)}, 是否继续？`,
  })

  if (!shouldUpdate)
    process.exit(0)

  if (isCancel(shouldUpdate)) {
    cancel(`${pico.red('✖')} 操作取消`)
    process.exit(0)
  }

  updatePackageVersion(cwd, nextVersion)

  const root = path.resolve(cwd, 'packages')
  updateAllPackages(root, nextVersion)

  console.log('')
  console.log(pico.green(`${'✓'} Version updated to ${pico.bold(pico.green(nextVersion))}`))

  const shouldPublish = await confirm({
    message: `是否执行发布`,
  })

  if (!shouldPublish)
    process.exit(0)

  if (isCancel(shouldPublish)) {
    cancel(`${pico.red('✖')} 操作取消`)
    process.exit(0)
  }

  execSync('pnpm publish -r --access public --no-git-checks', { stdio: 'inherit' })
})()

function getCurrenPackage(root) {
  const pkgFile = path.join(root, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'))
  return pkg
}

function getNextVersion(current, type = 'patch') {
  if (!semver.valid(current)) {
    logError(`Invalid semver version: ${current}`)
  }
  if (type === 'beta') {
    if (semver.prerelease(current)) {
      return semver.inc(current, 'prerelease')
    }
    else {
      return semver.inc(current, 'preminor', 'beta')
    }
  }

  return semver.inc(current, type)
}

function updatePackageVersion(pkgPath, newVersion) {
  const pkgFile = path.join(pkgPath, 'package.json')
  if (!fs.existsSync(pkgFile))
    return

  const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'))
  const oldVersion = pkg.version
  pkg.version = newVersion
  fs.writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`)

  console.log(
    `  ${pico.green('✓')} ${pkg.name || pkgFile} ${pico.dim(oldVersion)} ${pico.dim('→')} ${pico.bold(pico.green(newVersion))}`,
  )
}

function updateAllPackages(root, newVersion) {
  const dirs = fs.readdirSync(root)
  for (const dir of dirs) {
    const pkgPath = path.join(root, dir)
    if (fs.lstatSync(pkgPath).isDirectory()) {
      updatePackageVersion(pkgPath, newVersion)
    }
  }
}
