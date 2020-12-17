import fs from "fs";
import path from "path";
import { routers } from "./lib/router";

export class LoadConfig {
    private dir = path.resolve(process.cwd(), "src/common/tmp");
    private lib = path.resolve(__dirname, "lib");

    constructor() {
        this.init();
    }

    init() {
        this.mkdir();
        this.read();
    }

    private mkdir() {
        if (fs.existsSync(this.dir)) {
            fs.statSync(this.dir).isFile()
                ? fs.unlinkSync(this.dir)
                : fs.rmdirSync(this.dir, { recursive: true });
        }

        fs.mkdirSync(this.dir);

        const cp = (filename: string) =>
            fs.copyFileSync(path.resolve(this.lib, filename), path.resolve(this.dir, filename));

        cp("index.tsx");
        cp("registrar.tsx");
        cp("serviceWorker.ts");
    }

    private read() {
        console.log(routers);
    }
}
