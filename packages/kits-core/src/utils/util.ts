export const isObject = (val: unknown) => typeof val === 'object' && val !== null
export const mergeArrayWithDedupe = (a: any[], b: any[]) => [...new Set([...a, ...b])]

export function deepMerge(target: object, source: object) {
  for (const key of Object.keys(source)) {
    const oldVal = target[key]
    const newVal = source[key]

    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      target[key] = mergeArrayWithDedupe(oldVal, newVal)
    }
    else if (isObject(oldVal) && isObject(newVal)) {
      target[key] = deepMerge(oldVal, newVal)
    }
    else {
      target[key] = newVal
    }
  }

  return target
}

export function sortDependencies(packageJson: Record<string, any>) {
  const sorted = {}

  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']

  for (const depType of depTypes) {
    if (packageJson[depType]) {
      sorted[depType] = {}

      Object.keys(packageJson[depType])
        .sort()
        .forEach((name) => {
          sorted[depType][name] = packageJson[depType][name]
        })
    }
  }

  return {
    ...packageJson,
    ...sorted,
  }
}
