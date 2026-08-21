const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

module.exports = (env = {}, argv = {}) => {
  // Parámetros desde --env
  const port = env.port || 3000;
  const buildPack = env['build-pack'] || null;
  const libraryName = env['library-name'] || null;
  const environment = env.env || (argv.mode === 'production' ? 'prod' : 'dev');

  // Determinar output-path según el ambiente
  const outputPath = path.resolve(__dirname, `dist/${environment}`);

  // Cargar archivo .env según el ambiente (env=dev|qa|prod)
  const envFile = `.env.${environment}`;
  const envConfig = dotenv.config({ path: path.resolve(__dirname, envFile) });

  // Preparar variables de entorno para inyectar en el bundle
  const envVariables = {
    'process.env.NODE_ENV': JSON.stringify(argv.mode || 'development'),
  };
  Object.keys(process.env).forEach((key) => {
    envVariables[`process.env.${key}`] = JSON.stringify(process.env[key]);
  });

  return {
    mode: argv.mode || 'development',
    entry: './src/index.tsx',
    output: {
      path: outputPath,
      filename: 'bundle.js',
      clean: true,
      library: libraryName ? libraryName : undefined,
      libraryTarget: buildPack === 'npm' ? 'umd' : undefined,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: 'ts-loader',
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      // Inyectar variables de .env en el bundle
      new webpack.DefinePlugin(envVariables),
    ],
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    devServer: {
      port: port,
      hot: true,
      open: true,
    },
    devtool: 'source-map',
  };
};