/**
 *  Project ephemera
 *  Date 2020-09-04 18:49
 *  Author jiangfh
 *  Version 0.0.1
 *  Description 加载环境变量
 */

import fs from "fs";
import path from "path";
import paths from "./paths";
import { config } from "./lib/dotenv";
import { SCRIPT } from "../script";

/**
 * 加载环境变量
 */
export const loadEnvironment = () => {
    const NODE_ENV = process.env.NODE_ENV;
    if (!NODE_ENV) {
        throw new Error("缺少环境变量 NODE_ENV");
    }

    /**
     * 加载文件 .env, .env.local到环境变量
     */
    [
        paths.dotenv,
        NODE_ENV !== "test" ? `${paths.dotenv}.local` : "",
        `${paths.dotenv}.${NODE_ENV}`,
        `${paths.dotenv}.${NODE_ENV}.local`,
    ]
        .filter((x) => x)
        .forEach((dotenvFile) => {
            if (fs.existsSync(dotenvFile)) {
                config({ dotenvPath: dotenvFile });
            }
        });

    const appDirectory = fs.realpathSync(process.cwd());
    process.env.NODE_PATH = (process.env.NODE_PATH || "")
        .split(path.delimiter)
        .filter((folder) => folder && !path.isAbsolute(folder))
        .map((folder) => path.resolve(appDirectory, folder))
        .join(path.delimiter);
};

const REACT_APP = /^REACT_APP_/i;
export const getClientEnvironment = (publicUrl: string): SCRIPT.ENV.clientenv => {
    const raw = Object.keys(process.env)
        .filter((key) => REACT_APP.test(key))
        .reduce(
            (env, key) => {
                env[key] = process.env[key];
                return env;
            },
            {
                NODE_ENV: process.env.NODE_ENV || "development",
                PUBLIC_URL: publicUrl,
                WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
                WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
                WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
            } as SCRIPT.code
        );
    const stringified = {
        "process.env": Object.keys(raw).reduce((env, key) => {
            env[key] = JSON.stringify(raw[key]);
            return env;
        }, {} as SCRIPT.code),
    };
    return { raw, stringified };
};
