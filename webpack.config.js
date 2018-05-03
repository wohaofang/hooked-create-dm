let path = require('path')
module.exports = require('webpack-dev-bash/index').common.config(
  {
    babel:true,
    env: 'prod',
    output: path.resolve(__dirname, 'build'),
    projectPath: path.resolve(),
    publicPath: './split_module/'
  }
)