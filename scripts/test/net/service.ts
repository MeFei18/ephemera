import net from "net";
import chalk from "chalk";

let clients = new Map();
let clientId = 0;

const server = net.createServer();

server.on("connection", (client) => {
    console.log("新连接， id=", clientId + 1);
    //@ts-ignore
    client.id = ++clientId;
    clients.set(clientId, client);

    client.on("data", (msg) => {
        //@ts-ignore
        console.log(chalk.red.bold(`客户端${client.id}发来一个消息: ${msg}`));
        client.write("Hi\n");
    });

    client.on("close", () => {
        //@ts-ignore
        console.log(chalk.red.bold(`客户端${client.id}退出连接`));
        //@ts-ignore
        clients.delete(client.id);
    });
    client.on("error", (p1) => {
        console.log("error");
    });
});
server.listen(2020, "0.0.0.0", 0, () => {
    console.log(chalk.red.bold("打开服务: "), server.address());
});
