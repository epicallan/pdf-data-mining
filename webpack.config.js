module.exports = {
  entry: {
    app: './src/app.js',
    commands: './src/util/commands.js'
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
    // exclude: /(node_modules)/,
    modulesDirectories: [
      'src',
      'node_modules'
    ],
    extensions: ['', '.json', '.js']
  }
};
