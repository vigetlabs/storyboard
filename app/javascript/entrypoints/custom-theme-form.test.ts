import { beforeEach, describe, expect, it } from 'vitest'

describe('custom-theme-form', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <select id="custom_theme_header_font_family"><option value="Georgia">Georgia</option></select>
      <select id="custom_theme_body_font_family"><option value="Arial">Arial</option></select>
      <select id="custom_theme_choice_font_family"><option value="Verdana">Verdana</option></select>
      <select id="custom_theme_button_font_family"><option value="Courier">Courier</option></select>
    `
  })

  it('applies the selected font family to each field', async () => {
    await import('./custom-theme-form')

    const header = document.getElementById(
      'custom_theme_header_font_family'
    ) as HTMLSelectElement
    const body = document.getElementById(
      'custom_theme_body_font_family'
    ) as HTMLSelectElement
    const choice = document.getElementById(
      'custom_theme_choice_font_family'
    ) as HTMLSelectElement
    const button = document.getElementById(
      'custom_theme_button_font_family'
    ) as HTMLSelectElement

    header.value = 'Georgia'
    header.dispatchEvent(new Event('change'))
    body.value = 'Arial'
    body.dispatchEvent(new Event('change'))
    choice.value = 'Verdana'
    choice.dispatchEvent(new Event('change'))
    button.value = 'Courier'
    button.dispatchEvent(new Event('change'))

    expect(header.style.fontFamily).toBe('Georgia')
    expect(body.style.fontFamily).toBe('Arial')
    expect(choice.style.fontFamily).toBe('Verdana')
    expect(button.style.fontFamily).toBe('Courier')
  })
})
