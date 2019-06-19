const { environment } = require('@rails/webpacker')
const typescript = require('./loaders/typescript')

environment.loaders.append('typescript', typescript)

environment.config.merge({
  resolve: {
    alias: {
      // This is necessary to patch in a strange module issue with
      // storm-react-diagrams
      _: 'lodash'
    }
  }
})

module.exports = environment
