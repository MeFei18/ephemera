import webpack, { Configuration } from "webpack";
import { getClientEnvironment } from "../scripts/utils/env";
import paths from "../scripts/utils/paths";
import { SCRIPT } from "../scripts/script";
import path from "path";
import fs from "fs";

class WebpackConfig {
    // mode: Configuration["mode"];

    private static appPackageJson: any;
    private static NODE_ENV?: string;
    private static isEnvDevelopment: boolean;
    private static isEnvProduction: boolean;
    private static isEnvProductionProfile: boolean;
    private static shouldUseSourceMap: boolean;
    private static env: SCRIPT.ENV.clientenv = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

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

        return WebpackConfig.config();
    }

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
        };
    }
}

export default WebpackConfig;
