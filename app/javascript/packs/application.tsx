import '../src/global.css'
import '../src/type.css'
import '../src/button.css'
import '../src/modal.css'
import '../src/css/default/AccountForm.css'
import '../src/css/default/AdventureList.css'
import '../src/css/default/CustomThemeForm.css'
import '../src/css/default/StoryIndex.css'
import '../src/css/default/ThemeDark.css'
import '../src/css/default/FormattingHelp.css'

// Forward and back navigation don't cause a reload.  Since we are pulling
// data from a variable rendered by the server if we don't reload we don't
// get up to date data.  This is a workaround for that issue.
// More info: https://stackoverflow.com/a/42063482/1153149
window.addEventListener('pageshow', e => {
  if (
    e.persisted ||
    (window.performance && window.performance.navigation.type === 2)
  )
    location.reload(true)
})
