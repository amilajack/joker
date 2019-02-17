module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 10
      }
    }],
    ['@babel/preset-typescript', {
      allExtensions: true
    }]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties'
  ]
};
