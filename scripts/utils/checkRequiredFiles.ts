import fs from "fs";
import path from "path";
import chalk from "chalk";

/**
 * 检查文件是否存在
 * @param files 文件列表
 */
export const checkRequiredFiles = (files: string[]) => {
    let currentFilePath = "";
    try {
        files.forEach((filePath) => {
            currentFilePath = filePath;
            fs.accessSync(filePath, fs.constants.F_OK);
        });
        return true;
    } catch (err) {
        let dirName = path.dirname(currentFilePath);
        let fileName = path.basename(currentFilePath);
        console.log(chalk.red("Could not find a required file."));
        console.log(chalk.red("  Name: ") + chalk.cyan.bold(fileName));
        console.log(chalk.red("  Searched in: ") + chalk.cyan.bold(dirName));

        return false;
    }
};
