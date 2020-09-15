import webpack, { Configuration } from "webpack";
import { getClientEnvironment } from "../scripts/utils/env";
import paths from "../scripts/utils/paths";

class WebpackConfig {
    // mode: Configuration["mode"];

    private static NODE_ENV?: string;
    private static isEnvDevelopment: boolean;
    private static isEnvProduction: boolean;
    private static isEnvProductionProfile: boolean;
    private static env: SCRIPT.ENV.clientenv;

    constructor(NODE_ENV?: string) {
        // console.log(env);
    }

    /**
     *根据环境变量NODE_ENV创建webpack配置
     */
    public static createConfig() {
        const NODE_ENV = process.env.NODE_ENV;
        WebpackConfig.NODE_ENV = NODE_ENV;
        WebpackConfig.isEnvDevelopment = NODE_ENV == "development";
        WebpackConfig.isEnvProduction = NODE_ENV == "production";
        WebpackConfig.isEnvProductionProfile = this.isEnvProduction && process.argv.includes("--profile");
        WebpackConfig.env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

        return new WebpackConfig(NODE_ENV);
    }
}

export default WebpackConfig;
