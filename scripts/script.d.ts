import webpack from "webpack";
export declare namespace SCRIPT {
    interface code {
        [key: string]: string | number | boolean | Function | undefined;
    }

    namespace WEBPACK {
        interface cssOPtions {
            importLoaders: number;
            sourceMap: boolean;
            modules?: any;
        }

        interface loaders {
            loader: string;
            options: code;
        }
    }

    namespace ENV {
        interface clientenv {
            raw: code;
            stringified: {
                "process.env": webpack.DefinePlugin.CodeValueObject;
            };
        }
    }
}
