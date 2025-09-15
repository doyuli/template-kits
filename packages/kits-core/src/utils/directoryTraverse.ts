import * as fs from 'node:fs'
import * as path from 'node:path'

/**
 * @see https://github.com/vuejs/create-vue/blob/main/utils/directoryTraverse.ts
 */
export function preOrderDirectoryTraverse(
  dir: string,
  dirCallback: (dir: string) => void,
  fileCallback: (file: string) => void,
) {
  for (const filename of fs.readdirSync(dir)) {
    if (filename === '.git') {
      continue
    }
    const fullpath = path.resolve(dir, filename)
    if (fs.lstatSync(fullpath).isDirectory()) {
      dirCallback(fullpath)
      // in case the dirCallback removes the directory entirely
      if (fs.existsSync(fullpath)) {
        preOrderDirectoryTraverse(fullpath, dirCallback, fileCallback)
      }
      continue
    }
    fileCallback(fullpath)
  }
}

export const dotGitDirectoryState = {
  hasDotGitDirectory: false,
}

export function postOrderDirectoryTraverse(
  dir: string,
  dirCallback: (dir: string) => void,
  fileCallback: (file: string) => void,
) {
  for (const filename of fs.readdirSync(dir)) {
    if (filename === '.git') {
      dotGitDirectoryState.hasDotGitDirectory = true
      continue
    }
    const fullpath = path.resolve(dir, filename)
    if (fs.lstatSync(fullpath).isDirectory()) {
      postOrderDirectoryTraverse(fullpath, dirCallback, fileCallback)
      dirCallback(fullpath)
      continue
    }
    fileCallback(fullpath)
  }
}

export function canSkipEmptying(dir: string) {
  if (!fs.existsSync(dir)) {
    return true
  }

  const files = fs.readdirSync(dir)
  if (files.length === 0) {
    return true
  }
  if (files.length === 1 && files[0] === '.git') {
    dotGitDirectoryState.hasDotGitDirectory = true
    return true
  }

  return false
}

export function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return
  }

  postOrderDirectoryTraverse(
    dir,
    (dir: string) => fs.rmdirSync(dir),
    (file: string) => fs.unlinkSync(file),
  )
}
