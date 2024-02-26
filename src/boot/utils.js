import { boot } from 'quasar/wrappers'

import { Buffer } from 'buffer'
// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
    // something to do
  window.Buffer = Buffer
  window.global = window
  app.config.globalProperties.window = window
})
