const headerFontField = (document.getElementById("custom_theme_header_font_family")) as HTMLSelectElement;
const bodyFontField = (document.getElementById("custom_theme_body_font_family")) as HTMLSelectElement;
const choiceFontField = (document.getElementById("custom_theme_choice_font_family")) as HTMLSelectElement;
const buttonFontField = (document.getElementById("custom_theme_button_font_family")) as HTMLSelectElement;

if (headerFontField) {
  headerFontField.addEventListener("change", function() {
    headerFontField.style.fontFamily = headerFontField.value;
  });
}

if (bodyFontField) {
  bodyFontField.addEventListener("change", function() {
    bodyFontField.style.fontFamily = bodyFontField.value;
  });
}

if (choiceFontField) {
  choiceFontField.addEventListener("change", function() {
    choiceFontField.style.fontFamily = choiceFontField.value;
  });
}

if (buttonFontField) {
  buttonFontField.addEventListener("change", function() {
    buttonFontField.style.fontFamily = buttonFontField.value;
  });
}
