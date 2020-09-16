export declare namespace SCRIPT {
    interface code {
        [key: string]: string | number | boolean | undefined;
    }

    namespace ENV {
        interface clientenv {
            raw: code;
            stringified: {
                "process.env": code;
            };
        }
    }
}
