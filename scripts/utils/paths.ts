/**
 *  Project ephemera
 *  Date 2020-09-03 15:49
 *  Author jiangfh
 *  Version 0.0.1
 *  Description 加载模块路径
 */

import fs from "fs";
import path from "path";
// import getPublicUrlOrPath from "react-dev-utils/getPublicUrlOrPath";
import { getPublicUrlOrPath } from "./getPublicUrlOrPath";

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

const publicUrlOrPath = getPublicUrlOrPath(
    process.env.NODE_ENV === "development",
    require(resolveApp("package.json")).homepage,
    process.env.PUBLIC_URL
);

const moduleFileExtensions = [
    "web.mjs",
    "mjs",
    "web.js",
    "js",
    "web.ts",
    "ts",
    "web.tsx",
    "tsx",
    "json",
    "web.jsx",
    "jsx",
];

const resolveModule = (filePath: string) => {
    const extension = moduleFileExtensions.find((ex) => {
        fs.existsSync(resolveApp(`${filePath}.${ex}`));
    });
};

export default { publicUrlOrPath };
