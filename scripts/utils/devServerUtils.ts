import net from "net";
import url from "url";
import chalk from "chalk";
import { getIp } from "./address";
import path from "path";
import fs from "fs";

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

function resolveLoopback(proxy: string) {
    const o = url.parse(proxy);
    o.host = null;
    if (o.hostname !== "localhost") {
        return proxy;
    }
    // Unfortunately, many languages (unlike node) do not yet support IPv6.
    // This means even though localhost resolves to ::1, the application
    // must fall back to IPv4 (on 127.0.0.1).
    // We can re-enable this in a few years.
    /*try {
      o.hostname = address.ipv6() ? '::1' : '127.0.0.1';
    } catch (_ignored) {
      o.hostname = '127.0.0.1';
    }*/

    try {
        // Check if we're on a network; if we are, chances are we can resolve
        // localhost. Otherwise, we can just be safe and assume localhost is
        // IPv4 for maximum compatibility.
        if (!address.ip()) {
            o.hostname = "127.0.0.1";
        }
    } catch (_ignored) {
        o.hostname = "127.0.0.1";
    }
    return url.format(o);
}

export const prepareProxy = (proxy: string, appPublicFolder: string, servedPathname: string) => {
    console.log(proxy, appPublicFolder, servedPathname);

    if (!proxy) {
        return;
    }

    if (typeof proxy !== "string") {
        console.log(chalk.red('When specified, "proxy" in package.json must be a string.'));
        console.log(chalk.red('Instead, the type of "proxy" was "' + typeof proxy + '".'));
        process.exit(1);
    }

    const sockPath = process.env.WDS_SOCKET_PATH || "/sockjs-node";
    const isDefaultSockHost = !process.env.WDS_SOCKET_HOST;

    const mayProxy = (pathname: string) => {
        const maybePublicPath = path.resolve(
            appPublicFolder,
            pathname.replace(new RegExp("^" + servedPathname), "")
        );
        const isPublicFileRequest = fs.existsSync(maybePublicPath);
        // used by webpackHotDevClient
        const isWdsEndpointRequest = isDefaultSockHost && pathname.startsWith(sockPath);
        return !(isPublicFileRequest || isWdsEndpointRequest);
    };

    if (!/^http(s)?:\/\//.test(proxy)) {
        console.log(chalk.red(' "proxy" is must start with either http:// or https://'));
        process.exit(1);
    }

    let target;
    if (process.platform === "win32") {
    }
};
