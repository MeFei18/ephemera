import fs from "fs";
import path from "path";

const NEWLINE = "\n";
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
const RE_NEWLINES = /\\n/g;
const NEWLINES_MATCH = /\n|\r|\r\n/;

/**
 * Parses src into an Object
 */
export const parse = (src: string, debug: boolean) => {
    return src
        .toString()
        .split(NEWLINES_MATCH)
        .reduce((o, line, i) => {
            const keyValueArr = line.match(RE_INI_KEY_VAL);
            if (keyValueArr) {
                let key = keyValueArr[1];
                let val = keyValueArr[2] || "";

                const end = val.length - 1;
                const isDoubleQuoted = val[0] === '"' && val[end] === '"';
                const isSingleQuoted = val[0] === "'" && val[end] === "'";

                if (isSingleQuoted || isDoubleQuoted) {
                    val = val.substring(1, end);

                    if (isDoubleQuoted) {
                        val = val.replace(RE_NEWLINES, NEWLINE);
                    }
                } else {
                    val = val.trim();
                }
                o[key] = val;
            } else if (debug) {
                console.log(`did not match key and value when parsing line ${i + 1}: ${line}`);
            }
            return o;
        }, Object({}));
};

interface envFileOptions {
    debug?: boolean;
    dotenvPath?: string;
    encoding?: "ascii" | "utf-8" | "utf16le" | "ucs2" | "hex" | "utf8";
}

export const config = (options: envFileOptions) => {
    const { dotenvPath = path.resolve(process.cwd(), ".env"), debug = false, encoding = "utf8" } = options;

    try {
        const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), debug);
        Object.keys(parsed).forEach((key) => {
            process.env[key] = parsed[key];
        });

        return { parsed };
    } catch (e) {
        return { error: e };
    }
};
