import { beforeEach, describe, expect, it } from 'vitest'

describe('adventure-form', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <select id="adventure_theme">
        <option value="Light">Light</option>
        <option value="custom">custom</option>
      </select>
      <div id="custom_theme_section" class="no-display"></div>
    `
  })

  it('toggles the custom theme section', async () => {
    await import('./adventure-form')

    const themeField = document.getElementById('adventure_theme') as HTMLSelectElement
    const section = document.getElementById('custom_theme_section') as HTMLElement

    themeField.value = 'custom'
    themeField.dispatchEvent(new Event('change'))
    expect(section.classList.contains('no-display')).toBe(false)

    themeField.value = 'Light'
    themeField.dispatchEvent(new Event('change'))
    expect(section.classList.contains('no-display')).toBe(true)
  })
})
