module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        "targets": {
          "chrome": "80"
        }
      }
    ],
    ["@babel/preset-react", { "runtime": "automatic" }],
    "@babel/preset-typescript"
  ],
  plugins: [
    ["babel-plugin-react-native-web", { "commonjs": true }]
  ]
};
