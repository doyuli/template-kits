import { expect, it } from 'vitest'
import { foo } from '../src'

it('simple', () => {
  expect(foo).toBe('foo')
})
