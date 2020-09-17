import webpack, { Configuration } from "webpack";
import { getClientEnvironment } from "../scripts/lib/env";
import paths, { moduleFileExtensions } from "../scripts/lib/paths";
import { SCRIPT } from "../scripts/script";
import path from "path";
import fs from "fs";
import TerserPlugin from "terser-webpack-plugin";
import OptimizeCSSAssetsPlugin from "optimize-css-assets-webpack-plugin";
import safePostCssParser from "postcss-safe-parser";
import { modules } from "../scripts/lib/modules";
import { ModuleScopePlugin, getLocalIdent } from "../scripts/utils";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";

const postcssNormalize = require("postcss-normalize");
const PnpWebpackPlugin = require("pnp-webpack-plugin");

class WebpackConfig {
    private static cssRegex = /\.css$/;
    private static cssModuleRegex = /\.module\.css$/;
    private static lessRegex = /\.less$/;
    private static lessModuleRegex = /\.module\.less$/;
    private static appPackageJson: any;
    private static NODE_ENV?: string;
    private static isEnvDevelopment: boolean;
    private static isEnvProduction: boolean;
    private static isEnvProductionProfile: boolean;
    private static shouldUseSourceMap: boolean;
    private static env: SCRIPT.ENV.clientenv = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));
    private static useTypeScript: boolean;
    private static imageInlineSizeLimit: number;

    /**
     *根据环境变量NODE_ENV创建webpack配置
     */
    public static createConfig() {
        this.NODE_ENV = process.env.NODE_ENV;
        this.isEnvDevelopment = this.NODE_ENV == "development";
        this.isEnvProduction = this.NODE_ENV == "production";
        this.isEnvProductionProfile = this.isEnvProduction && process.argv.includes("--profile");
        this.shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false";
        this.appPackageJson = require(paths.appPackageJson);
        this.useTypeScript = fs.existsSync(paths.appTsConfig);
        this.imageInlineSizeLimit = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || "10000");

        return WebpackConfig.config();
    }

    private static _getStyleLoaders(cssOptions: SCRIPT.WEBPACK.cssOPtions, preProcessor?: string) {
        const loaders: any = [
            this.isEnvDevelopment && require.resolve("style-loader"),
            this.isEnvProduction && {
                loader: MiniCssExtractPlugin.loader,
                options: paths.publicUrlOrPath.startsWith(".") ? { publicPath: "../../" } : {},
            },
            {
                loader: require.resolve("postcss-loader"),
                options: {
                    ident: "postcss",
                    plugins: () => [
                        require("postcss-flexbugs-fixes"),
                        require("postcss-preset-env")({
                            autoprefixer: {
                                flexbox: "no-2009",
                            },
                            stage: 3,
                        }),
                        postcssNormalize(),
                    ],
                    sourceMap: this.isEnvProduction && this.shouldUseSourceMap,
                },
            },
        ].filter((x) => x != false);

        if (preProcessor) {
            loaders.push(
                {
                    loader: require.resolve("resolve-url-loader"),
                    options: {
                        sourceMap: this.isEnvProduction && this.shouldUseSourceMap,
                    },
                },
                {
                    loader: require.resolve(preProcessor),
                    options: {
                        sourceMap: true,
                    },
                }
            );
        }

        return loaders;
    }

    private static _webpackModule(): Configuration["module"] {
        return {
            strictExportPresence: true,
            rules: [
                { parser: { requireEnsure: false } },
                {
                    oneOf: [
                        /**
                         * url loader
                         */
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: require.resolve("url-loader"),
                            options: {
                                limit: this.imageInlineSizeLimit,
                                name: "static/media/[name].[hash:8].[ext]",
                            },
                        },

                        /**
                         * Process application JS with Babel.
                         */
                        {
                            test: /\.(js|mjs|jsx|ts|tsx)$/,
                            include: paths.appSrc,
                            loader: require.resolve("babel-loader"),
                            options: {
                                customize: require.resolve("babel-preset-react-app/webpack-overrides"),

                                plugins: [
                                    [
                                        require.resolve("babel-plugin-named-asset-import"),
                                        {
                                            loaderMap: {
                                                svg: {
                                                    ReactComponent: "@svgr/webpack?-svgo,+titleProp,+ref![path]",
                                                },
                                            },
                                        },
                                    ],
                                ],

                                cacheDirectory: true,
                                cacheCompression: false,
                                compact: this.isEnvProduction,
                            },
                        },

                        {
                            test: /\.(js|mjs)$/,
                            exclude: /@babel(?:\/|\\{1,2})runtime/,
                            loader: require.resolve("babel-loader"),
                            options: {
                                babelrc: false,
                                configFile: false,
                                compact: false,
                                presets: [[require.resolve("babel-preset-react-app/dependencies"), { helpers: true }]],
                                cacheDirectory: true,
                                // See #6846 for context on why cacheCompression is disabled
                                cacheCompression: false,

                                // Babel sourcemaps are needed for debugging into node_modules
                                // code.  Without the options below, debuggers like VSCode
                                // show incorrect code and set breakpoints on the wrong lines.
                                sourceMaps: this.shouldUseSourceMap,
                                inputSourceMap: this.shouldUseSourceMap,
                            },
                        },

                        /**
                         * css
                         */
                        {
                            test: this.cssRegex,
                            exclude: this.cssModuleRegex,
                            use: this._getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: this.isEnvProduction && this.shouldUseSourceMap,
                            }),
                            sideEffects: true,
                        },

                        {
                            test: this.cssModuleRegex,
                            use: this._getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: this.isEnvProduction && this.shouldUseSourceMap,
                                modules: { getLocalIdent: getLocalIdent },
                            }),
                        },

                        /**
                         * less
                         */
                        {
                            test: this.lessRegex,
                            exclude: this.lessModuleRegex,
                            use: this._getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: this.isEnvProduction && this.shouldUseSourceMap,
                                },
                                "less-loader"
                            ),
                            sideEffects: true,
                        },
                        {
                            test: this.lessModuleRegex,
                            use: this._getStyleLoaders(
                                {
                                    importLoaders: 3,
                                    sourceMap: this.isEnvProduction && this.shouldUseSourceMap,
                                    modules: { getLocalIdent: getLocalIdent },
                                },
                                "less-loader"
                            ),
                        },

                        /**
                         * file loader
                         */
                        {
                            loader: require.resolve("file-loader"),
                            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                            options: {
                                name: "static/media/[name].[hash:8].[ext]",
                            },
                        },
                        // ** STOP ** Are you adding a new loader?
                        // Make sure to add the new loader(s) before the "file" loader.
                    ],
                },
            ],
        };
    }

    /**
     * js压缩c插件(支持es6)
     */
    private static getTerserPlugin(): TerserPlugin {
        return new TerserPlugin({
            terserOptions: {
                parse: { ecma: 8 },
                compress: {
                    ecma: 5,
                    warnings: false,
                    comparisons: false,
                    inline: 2,
                },
                mangle: {
                    safari10: true,
                },
                keep_classnames: this.isEnvProductionProfile,
                keep_fnames: this.isEnvProductionProfile,
                output: {
                    ecma: 5,
                    comments: false,
                    ascii_only: true,
                },
            },
            sourceMap: this.shouldUseSourceMap,
        });
    }

    /**
     * css压缩优化
     */
    private static getOptimizeCSSAssetsPlugin(): OptimizeCSSAssetsPlugin {
        return new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: {
                parser: safePostCssParser,
                map: this.shouldUseSourceMap
                    ? {
                          inline: false,
                          annotation: true,
                      }
                    : false,
            },
            cssProcessorPluginOptions: {
                preset: ["default", { minifyFontValues: { removeQuotes: false } }],
            },
        });
    }

    /**
     * 解析模块
     */
    private static _resolve(): Configuration["resolve"] {
        return {
            modules: ["node_modules", paths.appNodeModules].concat(modules.getAdditionalModulePaths() || []),
            extensions: moduleFileExtensions
                .map((ext) => `.${ext}`)
                .filter((ext) => this.useTypeScript || !ext.includes("ts")),
            alias: {
                "react-native": "react-native-web",
                ...(this.isEnvProductionProfile && {
                    "react-dom$": "react-dom/profiling",
                    "schduler/tracing": "scheduler/tracing-profiling",
                }),
                ...(modules.getWebpackAliases || {}),
            },
            plugins: [
                PnpWebpackPlugin,
                /**
                 *确保文件从src/、node_modules导入
                 */
                new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
            ],
        };
    }

    /**
     * webpack配置
     */
    private static config(): Configuration {
        return {
            mode: this.isEnvProduction ? "production" : this.isEnvDevelopment ? "development" : "none",
            bail: this.isEnvProduction,
            devtool: this.isEnvProduction
                ? this.shouldUseSourceMap
                    ? "source-map"
                    : false
                : this.isEnvDevelopment && "cheap-module-source-map",

            /**
             * 入口
             */
            entry: [
                // this.isEnvDevelopment ? require.resolve("react-dev-utils/webpackHotDevClient") : "" /**TODO */,
                paths.appIndexJs,
            ].filter((x) => x),

            /**
             * 输出
             */
            output: {
                path: this.isEnvProduction ? paths.appBuild : undefined,
                pathinfo: this.isEnvDevelopment,
                filename: this.isEnvProduction
                    ? "static/js/[name].[contenthash:8].js"
                    : (this.isEnvDevelopment && "static/js/bundle.js") || "",
                chunkFilename: this.isEnvProduction
                    ? "static/js/[name].[contenthash:8].chunk.js"
                    : (this.isEnvDevelopment && "static/js/bundle.js") || "",
                publicPath: paths.publicUrlOrPath,
                devtoolModuleFilenameTemplate: this.isEnvProduction
                    ? (info) => {
                          console.log("=========", info.absoluteResourcePath);
                          return path.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, "/");
                      }
                    : (this.isEnvDevelopment &&
                          ((info) => path.resolve(info.absoluteResourcePath).replace(/\\/g, "/"))) ||
                      "",

                jsonpFunction: `webpackJsonp${this.appPackageJson.name}`,
            },

            /**
             * 优化
             */
            optimization: {
                minimize: this.isEnvProduction,
                minimizer: [this.getTerserPlugin(), this.getOptimizeCSSAssetsPlugin()],
                splitChunks: {
                    chunks: "all",
                    name: false,
                },
                runtimeChunk: {
                    name: (entrypoint) => `runtime-${entrypoint.name}`,
                },
            },
            resolve: this._resolve(),
            resolveLoader: {
                plugins: [PnpWebpackPlugin.moduleLoader(module)],
            },
            module: this._webpackModule(),

            /**
             * 插件管理
             */
            plugins: [

                new HtmlWebpackPlugin(
                    Object.assign(
                        {},
                        {
                            inject: true,
                            template: paths.appHtml,
                        },
                        this.isEnvProduction
                            ? {
                                  minify: {
                                      removeComments: true,
                                      collapseWhitespace: true,
                                      removeRedundantAttributes: true,
                                      useShortDoctype: true,
                                      removeEmptyAttributes: true,
                                      removeStyleLinkTypeAttributes: true,
                                      keepClosingSlash: true,
                                      minifyJS: true,
                                      minifyCSS: true,
                                      minifyURLs: true,
                                  },
                              }
                            : undefined
                    )
                ),

                
            ],
        };
    }
}

export default WebpackConfig;
