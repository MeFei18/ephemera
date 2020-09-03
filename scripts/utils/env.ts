/**
 *  Project ephemera
 *  Date 2020-09-03 15:49
 *  Author jiangfh
 *  Version 0.0.1
 *  Description 加载环境变量
 */

import fs from "fs";
import path from "path";
import paths from "./paths";

/**
 * 加载环境变量
 */
export const loadEnvironment = () => {
    const NODE_ENV = process.env.NODE_ENV;
    if (!NODE_ENV) {
        throw new Error("缺少环境变量 NODE_ENV");
    }

    const dotenvFiles = [
        `${paths.dotenv}.${NODE_ENV}.local`,
        `${paths.dotenv}.${NODE_ENV}`,
        NODE_ENV !== "test" ? `${paths.dotenv}.local` : "",
        paths.dotenv,
    ].filter((x) => x);

    // dotenvFiles.forEach((dotenvFile) => {
    //     if(fs.existsSync(dotenvFile))
    // });
    console.log(dotenvFiles);
};
