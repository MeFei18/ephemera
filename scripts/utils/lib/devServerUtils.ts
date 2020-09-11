import net from "net";

const listen = (port: number) => {
    const server = net.createServer().listen(port);

    return new Promise((resolve, reject) => {
        server.on("listening", () => {
            server.close();
            resolve(port);
        });

        server.on("error", (err) => {
            // reject("111");
            resolve(listen(port + 1));
        });
    });
};

/**
 * 选择端口, 如果默认端口繁忙则选择新端口
 */
export const choosePort = (host: string, defaultPort: number) => {
    listen(9000).then((p) => console.log(p));
};
