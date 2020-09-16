import fs from "fs";
import path from "path";
import paths from "./paths";
import chalk from "chalk";
import resolve from "resolve";

export namespace modules {
    export const hasTsConfig = fs.existsSync(paths.appTsConfig);
    const hasJsConfig = fs.existsSync(paths.appJsConfig);

    export const getOption = () => {
        if (hasTsConfig && hasJsConfig) {
            throw new Error(
                "You have both a tsconfig.json and a jsconfig.json. If you are using TypeScript please remove your jsconfig.json file."
            );
        }
        let config;
        if (hasTsConfig) {
            const ts = require(resolve.sync("typescript", { basedir: paths.appNodeModules }));
            config = ts.readConfigFile(paths.appTsConfig, ts.sys.readFile).config;
        } else if (hasJsConfig) {
            config = require(paths.appJsConfig);
        }

        config = config || {};
        const options = config.compilerOptions || {};
        return options;
    };
}
