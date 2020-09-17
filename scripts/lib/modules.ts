import fs from "fs";
import path from "path";
import paths from "./paths";
import chalk from "chalk";
import resolve from "resolve";

export namespace modules {
    export const hasTsConfig = fs.existsSync(paths.appTsConfig);
    const hasJsConfig = fs.existsSync(paths.appJsConfig);
    const options = getOption();

    function getOption() {
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
    }

    /**
     * Get additional module paths based on the baseUrl of a compilerOptions object.
     *
     * @param {Object} options
     */
    export const getAdditionalModulePaths = () => {
        const baseUrl: string | undefined = options.baseUrl;

        if (!baseUrl) {
            const nodePath = process.env.NODE_PATH || "";
            return nodePath.split(path.delimiter).filter(Boolean);
        }
        const baseUrlResilved = path.resolve(paths.appPath, baseUrl);

        if (path.relative(paths.appNodeModules, baseUrlResilved) == "") {
            return null;
        }

        if (path.relative(paths.appSrc, baseUrlResilved) == "") {
            return [paths.appSrc];
        }

        if (path.relative(paths.appPath, baseUrlResilved) == "") {
            return null;
        }
        throw new Error(chalk.red.bold("baseUrl 路径设置错误"));
    };

    /**
     * Get webpack aliases based on the baseUrl of a compilerOptions object.
     *
     * @param {*} options
     */
    export const getWebpackAliases = () => {
        const baseUrl = options.baseUrl;

        if (!baseUrl) {
            return {};
        }
        const baseUrlResolved = path.resolve(paths.appPath, baseUrl);
        if (path.relative(paths.appPath, baseUrlResolved) === "") {
            return {
                src: paths.appSrc,
            };
        }
        return;
    };

    export const getJestAliases = () => {
        const baseUrl = options.baseUrl;

        if (!baseUrl) {
            return {};
        }

        const baseUrlResolved = path.resolve(paths.appPath, baseUrl);

        if (path.relative(paths.appPath, baseUrlResolved) === "") {
            return {
                "^src/(.*)$": "<rootDir>/src/$1",
            };
        }
        return;
    };
}
