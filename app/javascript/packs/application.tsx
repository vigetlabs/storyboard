import '../src/global.css'
import '../src/type.css'
import '../src/button.css'
import '../src/css/default/AccountForm.css'
import '../src/css/default/AdventureList.css'
import '../src/css/default/StoryIndex.css'
import '../src/css/default/ThemeDark.css'

// Forward and back navigation don't cause a reload.  Since we are pulling
// data from a variable rendered by the server if we don't reload we don't
// get up to date data.  This is a workaround for that issue.
if (performance.navigation.type === 2) location.reload(true)
