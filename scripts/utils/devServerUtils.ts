import net from "net";

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
