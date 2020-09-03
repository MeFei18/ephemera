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
export const readEnvironment = () => {
    const NODE_ENV = process.env.NODE_ENV;
    process.env.PUBLIC_URL = "index";
    if (!NODE_ENV) {
        throw new Error("缺少环境变量 NODE_ENV");
    }

    // console.log(paths.publicUrlOrPath);
};
