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
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

import { loadEnvironment } from "./utils/env";

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

import fs from "fs";
import webpack from "webpack";
import paths from "./utils/paths";
import webpackDevServer from "webpack-dev-server";

import { checkRequiredFiles, clearConsole } from "./utils/lib";

// clearConsole();

if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1);
}
