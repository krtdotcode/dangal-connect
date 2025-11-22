const webpack = require('webpack');
const { config } = require('dotenv');
const path = require('path');

// Load environment variables from .env file
const env = config({ path: path.join(__dirname, '.env') }).parsed;

module.exports = (config) => {
  return {
    ...config,
    plugins: [
      ...config.plugins,
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(env || {})
      })
    ]
  };
};
