module.exports = {
  entry: {
    app: './src/app.js',
    util: './src/util/bashCommands.js'
  },
  target: 'node',
  output: {
    path: './dist',
    filename: '[name].js'
  },
  progress: true,
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  },
  resolve: {
    modulesDirectories: [
      'src',
      'node_modules'
    ],
    extensions: ['', '.json', '.js']
  }
};
