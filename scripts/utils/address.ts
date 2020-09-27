import os from "os";

export class Address {
    private static getInterfaceName() {
        let val = "eth";
        const platform = os.platform();
        if (platform === "darwin") {
            val = "en";
        } else if (platform === "win32") {
            val = "";
        }
        return val;
    }

    private static addressInterface(family: string, name?: string) {
        const interfaces = os.networkInterfaces();
        const interfaceName = name || Address.getInterfaceName();
        family = family || "IPv4";

        for (let i = -1; i < 8; i++) {
            const item = interfaces[`${interfaceName}${i >= 0 ? i : 0}`]?.find(
                (x) => x.family === family
            );
            if (item) {
                return item;
            }
        }

        if (name) {
            for (var k in interfaces) {
                const item = interfaces[k]?.find(
                    (x) => x.family === family && x.address != "127.0.0.1"
                );

                if (item) {
                    return item;
                }
            }
        }

        return;
    }

    public static ip(interfaceName?: string) {
        const item = Address.addressInterface("IPv4", interfaceName);
        return item && item.address;
    }
}
