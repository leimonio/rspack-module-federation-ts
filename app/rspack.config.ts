import { rspack, Configuration } from "@rspack/core";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as ReactRefreshPlugin from "@rspack/plugin-react-refresh";

const isProduction = process.env.NODE_ENV === 'production';

const config: Configuration = {
  entry: './src/index.ts',
  context: __dirname,
  output: {
    // set uniqueName explicitly to make react-refresh works
    uniqueName: 'app',
  },
  resolve: {
		extensions: ["...", ".ts", ".tsx", ".jsx"]
	},
  module: {
    rules: [
      {
				test: /\.(jsx?|tsx?)$/,
				use: [
					{
						loader: "builtin:swc-loader",
						options: {
							jsc: {
								parser: {
									syntax: "typescript",
									tsx: true
								},
								transform: {
									react: {
										runtime: "automatic",
										development: !isProduction,
										refresh: !isProduction
									}
								}
							},
							env: {
								targets: [
									"chrome >= 87",
									"edge >= 88",
									"firefox >= 78",
									"safari >= 14"
								]
							}
						}
					}
				]
			},
      {
				test: /\.svg$/,
				type: "asset"
			},
    ],
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new rspack.container.ModuleFederationPlugin({
      name: 'app',
      // List of remotes with URLs
      remotes: {
        'mfe-b': 'mfeBBB@http://localhost:8081/mfeBBB.js',
        'mfe-c': 'mfeCCC@http://localhost:8082/mfeCCC.js',
      },

      // list of shared modules with optional options
      shared: {
        // specifying a module request as shared module
        // will provide all used modules matching this name (version from package.json)
        // and consume shared modules in the version specified in dependencies from package.json
        // (or in dev/peer/optionalDependencies)
        // So it use the highest available version of this package matching the version requirement
        // from package.json, while providing it's own version to others.
        react: {
          singleton: true, // make sure only a single react module is used
        },
      },

      // list of runtime plugin modules (feature of MF1.5)
      runtimePlugins: ['./src/runtimePlugins/logger.js'],
    }),
    !isProduction && new ReactRefreshPlugin(),
  ],
  devServer: {
    port: 8080,
  },
};

export default config;