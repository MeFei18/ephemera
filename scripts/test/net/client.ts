import net from "net";
import chalk from "chalk";

let client = new net.Socket();

client.setEncoding("utf8");
client.connect(2020, "192.168.5.170", () => {
    client.write(
        JSON.stringify({
            name: "client1",
            id: "ef07-8qjk",
        })
    );
});

client.on("data", (msg) => {
    console.log(chalk.blue.bold(msg.toString()));
});

client.on("close", () => {
    console.log(chalk.blue("下线啦"));
});
