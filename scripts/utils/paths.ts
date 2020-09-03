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
    const extension = moduleFileExtensions.find((ex) =>
        fs.existsSync(resolveApp(`${filePath}.${ex}`))
    );
    if (extension) {
        return resolveApp(`${filePath}.${extension}`);
    }
    return resolveApp(`${filePath}.js`);
};

export default {
    dotenv: resolveApp(".env"),
    appPath: resolveApp("."),
    appBuild: resolveApp("dist"),
    appPublic: resolveApp("public"),
    appHtml: resolveApp("public/index.html"),
    appIndexJs: resolveModule("src/index"),
    appPackageJson: resolveApp("package.json"),
    appSrc: resolveApp("src"),
    appTsConfig: resolveApp("tsconfig.json"),
    appJsConfig: resolveApp("jsconfig.json"),
    yarnLockFile: resolveApp("yarn.lock"),
    testsSetup: resolveModule("src/setupTests"),
    proxySetup: resolveApp("src/setupProxy.js"),
    appNodeModules: resolveApp("node_modules"),
    publicUrlOrPath,
};
