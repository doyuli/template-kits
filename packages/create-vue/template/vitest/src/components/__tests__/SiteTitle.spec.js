import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SiteTitle from '../SiteTitle.vue'

describe('siteTitle', () => {
  it('renders properly', () => {
    const wrapper = mount(SiteTitle, { props: { title: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})
