const customThemeSection = document.getElementById("custom_theme_section");
const themeField = (document.getElementById("adventure_theme")) as HTMLSelectElement;

if (themeField && customThemeSection) {
  themeField.addEventListener("change", function() {
    if (themeField.value == "custom") {
      customThemeSection.classList.remove("no-display");
    } else {
      customThemeSection.classList.add("no-display");
    }
  });
}
