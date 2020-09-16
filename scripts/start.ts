/**
 *  Project ephemera
 *  Date 2020-09-03 15:49
 *  Author jiangfh
 *  Version 0.0.1
 *  Description 启动开发环境
 */

/**
 * 初始化环境变量为 development
 */
import fs from "fs";
import webpack from "webpack";
import paths from "./utils/paths";
import { loadEnvironment } from "./utils/env";
import webpackDevServer from "webpack-dev-server";
import chalk from "chalk";
import WebpackConfig from "../config/webpack.dev";

import { checkRequiredFiles, clearConsole, checkBrowsers, choosePort } from "./utils/lib";

process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

const isInteractive = process.stdout.isTTY;

/**
 * 遇到错误且未捕获时，让系统崩溃
 */
process.on("unhandledRejection", (err) => {
    throw err;
});

/**
 * 加载环境变量
 */
loadEnvironment();

if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1);
}

const DEFAULT_PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

if (process.env.HOST) {
    console.log(chalk.cyan(`Attempting to bind to HOST environment variable: ${chalk.yellow.bold(process.env.HOST)}`));
}

checkBrowsers(paths.appPath)
    .then(() => choosePort(HOST, DEFAULT_PORT))
    .then((port) => {
        console.log(chalk.cyan("Port: "), chalk.yellow.bold(port));
        if (!port) {
            console.log(chalk.red.bold("we have not found a port!"));
            return;
        }

        // const config = new WebpackConfig();
        const config = WebpackConfig.createConfig();
        console.log(config);
    });
