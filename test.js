const { normalize, config } = require('./dist/main-node')
config.preloadCache = true
normalize('滋賀県米原市大久保848-1').then(console.log)
