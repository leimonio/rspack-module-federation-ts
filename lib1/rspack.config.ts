import { rspack, Configuration } from "@rspack/core";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as ReactRefreshPlugin from "@rspack/plugin-react-refresh";

const isProduction = process.env.NODE_ENV === 'production';

const config: Configuration = {
  entry: './src/index.ts',
  context: __dirname,
  output: {
    // set uniqueName explicitly to make react-refresh works
    uniqueName: 'lib1',
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
    new HtmlWebpackPlugin({
      // exclude container entry from html, to use the correct HMR handler
      excludeChunks: ['mfeBBB'],
    }),
    new rspack.container.ModuleFederationPlugin({
      // A unique name
      name: 'mfeBBB',
      // List of exposed modules
      exposes: {
        './Component': './src/Component',
      },

      // list of shared modules
      shared: [
        // date-fns is shared with the other remote, app doesn't know about that
        'date-fns',
        {
          react: {
            singleton: true, // must be specified in each config
          },
        },
      ],
    }),
    !isProduction && new ReactRefreshPlugin(),
  ],
  devServer: {
    port: 8081,
    // add CORS header for HMR chunk (xxx.hot-update.json and xxx.hot-update.js)
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};

export default config;
