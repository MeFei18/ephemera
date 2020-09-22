import net from "net";
import url from "url";
import chalk from "chalk";
import { getIp } from "./address";

const listen = (port: number): Promise<number> => {
    const server = net.createServer().listen(port);

    return new Promise((resolve, _) => {
        server.on("listening", () => {
            server.close();
            resolve(port);
        });

        server.on("error", (err) => {
            resolve(listen(port + 1));
        });
    });
};

/**
 * 选择端口, 如果默认端口繁忙则选择新端口
 */
export const choosePort = (host: string, defaultPort: number): Promise<number> =>
    listen(defaultPort);

export const prepareUrls = (protocol: string, host: string, port: number, pathname = "/") => {
    const formatUrl = (hostname: string) => {
        return url.format({
            protocol,
            hostname,
            port,
            pathname,
        });
    };
    const prettyPrintUrl = (hostname: string) =>
        url.format({
            protocol,
            hostname,
            port: chalk.bold(port),
            pathname,
        });

    const isUnspecifiedHost = host === "0.0.0.0" || host === "::";
    let prettyHost, lanUrlForConfig, lanUrlForTerminal;

    if (isUnspecifiedHost) {
        prettyHost = "localhost";

        try {
            lanUrlForConfig = getIp();
            if (lanUrlForConfig) {
                if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(lanUrlForConfig)) {
                    lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
                } else {
                    lanUrlForTerminal = undefined;
                }
            }
        } catch (e) {
            console.log(chalk.red.bold(e));
        }
    } else {
        prettyHost = host;
    }
    const localUrlForTerminal = prettyPrintUrl(prettyHost);
    const localUrlForBrowser = formatUrl(prettyHost);
    return {
        lanUrlForConfig,
        lanUrlForTerminal,
        localUrlForTerminal,
        localUrlForBrowser,
    };
};
