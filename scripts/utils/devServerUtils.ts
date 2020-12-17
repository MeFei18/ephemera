import net from "net";
import url from "url";
import chalk from "chalk";
import { Address } from "./address";
import path from "path";
import fs from "fs";
import webpack from "webpack";
import { clearConsole } from "./clearConsole";
import { typescriptFormatter } from "./typescriptFormatter";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import { formatWebpackMessages } from "./formatWebpackMessage";

interface Urls {
    lanUrlForConfig?: string;
    lanUrlForTerminal?: string;
    localUrlForTerminal: string;
    localUrlForBrowser: string;
}

interface compilerProps {
    appName: string;
    config: webpack.Configuration;
    devSocket: {
        warnings(warn: any): void;
        errors(err: any): void;
    };
    urls: Urls;
    useYarn: boolean;
    useTypeScript: boolean;
    tscCompileOnError: boolean;
    webpack: Function;
}

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

export const prepareUrls = (protocol: string, host: string, port: number, pathname = "/"): Urls => {
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
            lanUrlForConfig = Address.ip();
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
        if (!Address.ip()) {
            o.hostname = "127.0.0.1";
        }
    } catch (_ignored) {
        o.hostname = "127.0.0.1";
    }
    return url.format(o);
}

export const prepareProxy = (proxy: string, appPublicFolder: string, servedPathname: string) => {
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

    let target: string;
    if (process.platform === "win32") {
        target = resolveLoopback(proxy);
    } else {
        target = proxy;
    }

    return [
        {
            target,
            logLevel: "silent",
            context: (pathname: string, req: any) => {
                return (
                    req.method !== "GET" ||
                    (mayProxy(pathname) &&
                        req.headers.accept &&
                        req.headers.accept.indexOf("text/html") === -1)
                );
            },
            onProxyReq: (proxyReq: any) => {
                if (proxyReq.getHeader("origin")) {
                    proxyReq.setHeader("origin", target);
                }
            },
            onError: onProxyError(target),
            secure: false,
            changeOrigin: true,
            ws: true,
            xfwd: true,
        },
    ];
};

function onProxyError(proxy: string) {
    return (err: any, req: any, res: any) => {
        const host = req.headers && req.headers.host;
        console.log(
            chalk.red("Proxy error:") +
                " Could not proxy request " +
                chalk.cyan(req.url) +
                " from " +
                chalk.cyan(host) +
                " to " +
                chalk.cyan(proxy) +
                "."
        );
        console.log(
            "See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (" +
                chalk.cyan(err.code) +
                ")."
        );
        if (res.writeHead && !res.headersSent) {
            res.writeHead(500);
        }
        res.end(
            "Proxy error: Could not proxy request " +
                req.url +
                " from " +
                host +
                " to " +
                proxy +
                " (" +
                err.code +
                ")."
        );
    };
}

export class DevServerUtils {
    private static isInteractive = process.stdout.isTTY;

    private static printInstructions(
        appName: unknown,
        urls: { lanUrlForTerminal: any; localUrlForTerminal: any },
        useYarn: any
    ) {
        console.log();
        console.log(`You can now view ${chalk.bold(appName)} in the browser.`);
        console.log();

        if (urls.lanUrlForTerminal) {
            console.log(`  ${chalk.bold("Local:")}            ${urls.localUrlForTerminal}`);
            console.log(`  ${chalk.bold("On Your Network:")}  ${urls.lanUrlForTerminal}`);
        } else {
            console.log(`  ${urls.localUrlForTerminal}`);
        }

        console.log();
        console.log("Note that the development build is not optimized.");
        console.log(
            `To create a production build, use ` +
                `${chalk.cyan(`${useYarn ? "yarn" : "npm run"} build`)}.`
        );
        console.log();
    }

    static createCompiler(props: compilerProps) {
        const {
            appName,
            config,
            devSocket,
            urls,
            useYarn,
            useTypeScript,
            tscCompileOnError,
            // webpack,
        } = props;

        let compiler: webpack.Compiler;

        try {
            compiler = webpack(config);
        } catch (err) {
            console.log(chalk.red("Failed to compile."));
            console.log(err.message || err);
            process.exit(1);
        }

        /**
         * 加载文件变更监听事件
         */
        compiler.hooks.invalid.tap("invalid", () => {
            if (this.isInteractive) {
                clearConsole();
            }
            console.log("Compiling...");
        });

        let isFirstCompile = true;
        let tsMessagesPromise: any;
        let tsMessagesResolver: (msg: any) => void;

        if (useTypeScript) {
            compiler.hooks.beforeCompile.tap("beforeCompile", () => {
                tsMessagesPromise = new Promise((resolve) => {
                    tsMessagesResolver = (msgs: any) => resolve(msgs);
                });
            });

            ForkTsCheckerWebpackPlugin.getCompilerHooks(compiler).waiting.tap(
                "afterTypeScriptCheck",
                (diagnostics: any, lints: any) => {
                    const allMsgs = [...diagnostics, ...lints];
                    const format = (message: any) =>
                        `${message.file}\n${typescriptFormatter(message, true)}`;

                    tsMessagesResolver({
                        errors: allMsgs.filter((msg) => msg.severity === "error").map(format),
                        warnings: allMsgs.filter((msg) => msg.severity === "warning").map(format),
                    });
                }
            );
        }

        // "done" event fires when webpack has finished recompiling the bundle.
        // Whether or not you have warnings or errors, you will get this event.
        compiler.hooks.done.tap("done", async (stats) => {
            if (DevServerUtils.isInteractive) {
                clearConsole();
            }

            const statsData = stats.toJson({
                all: false,
                warnings: true,
                errors: true,
            });

            if (useTypeScript && statsData.errors.length === 0) {
                const delayMsg = setTimeout(() => {
                    console.log(
                        chalk.yellow("Files successfully emitted, waiting for typecheck results...")
                    );
                }, 100);

                const messages = await tsMessagesPromise;
                clearTimeout(delayMsg);

                if (tscCompileOnError) {
                    statsData.warnings.push(...messages.errors);
                } else {
                    statsData.errors.push(...messages.errors);
                }

                statsData.warnings.push(...messages.warnings);

                if (messages.errors.length > 0) {
                    if (tscCompileOnError) {
                        devSocket.warnings(messages.errors);
                    } else {
                        devSocket.errors(messages.errors);
                    }
                } else if (messages.warnings.length > 0) {
                    devSocket.warnings(messages.warnings);
                }

                if (DevServerUtils.isInteractive) {
                    clearConsole();
                }
            }

            const messages = formatWebpackMessages(statsData);
            const isSuccessful = !messages.errors.length && !messages.warnings.length;
            if (isSuccessful) {
                console.log(chalk.green("Compiled successfully!"));
            }
            if (isSuccessful && (DevServerUtils.isInteractive || isFirstCompile)) {
                DevServerUtils.printInstructions(appName, urls, useYarn);
            }
            isFirstCompile = false;

            // If errors exist, only show errors.
            if (messages.errors.length) {
                // Only keep the first error. Others are often indicative
                // of the same problem, but confuse the reader with noise.
                if (messages.errors.length > 1) {
                    messages.errors.length = 1;
                }
                console.log(chalk.red("Failed to compile.\n"));+

                
                console.log(messages.errors.join("\n\n"));
                return;
            }

            // Show warnings if no errors were found.
            if (messages.warnings.length) {
                console.log(chalk.yellow("Compiled with warnings.\n"));
                console.log(messages.warnings.join("\n\n"));

                // Teach some ESLint tricks.
                console.log(
                    "\nSearch for the " +
                        chalk.underline(chalk.yellow("keywords")) +
                        " to learn more about each warning."
                );
                console.log(
                    "To ignore, add " +
                        chalk.cyan("// eslint-disable-next-line") +
                        " to the line before.\n"
                );
            }
        });
    }
}
