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

loadEnvironment();

// for (const key in process.env) {
//     console.log(key, "===========", process.env[key]);
// }
