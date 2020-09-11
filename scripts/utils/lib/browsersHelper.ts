import fs from "fs";
import path from "path";
import chalk from "chalk";

interface code {
    [key: string]: string[];
}

const defaultBrowsers = {
    production: [">0.2%", "not dead", "not op_mini all"],
    development: ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"],
};

const load = (dir: string): string[] => {
    try {
        const NODE_ENV = process.env.NODE_ENV;
        let data: code = {};
        const filePath = path.resolve(dir, "package.json");
        if (fs.existsSync(filePath)) {
            data = JSON.parse(fs.readFileSync(filePath).toString())["browserslist"] || defaultBrowsers;
        }
        return data[NODE_ENV || "development"];
    } catch (err) {
        console.log(chalk.red.bold(err));
        return [];
    }
};

export const checkBrowsers = (dir: string) => {
    const current: string[] = load(dir);
    return Promise.resolve(current);
};
