const deal = (url: string, isEnvDevelopment: boolean) => {
    const local = "http://localhost";

    let publicUrl = url.endsWith("/") ? url : url + "/";

    /**
     * 校验publicUrl
     */
    const validPublicUrl = new URL(publicUrl, local).pathname;

    const checkdot = (str: string, replace: string = "/") => (str.startsWith(".") ? replace : validPublicUrl);
    return isEnvDevelopment ? checkdot(publicUrl) : checkdot(publicUrl, publicUrl);
};

/**
 * Returns a URL or a path with slash at the end
 * In production can be URL, abolute path, relative path
 * In development always will be an absolute path
 * In development can use `path` module functions for operations
 *
 * @param isEnvDevelopment boolean
 * @param homepage  string|undefined
 * @param envPublicUrl string|undefined
 * @returns string
 */
export const getPublicUrlOrPath = (isEnvDevelopment: boolean, homepage?: string, envPublicUrl?: string) => {
    if (envPublicUrl) {
        return deal(envPublicUrl, isEnvDevelopment);
    }

    if (homepage) {
        return deal(homepage, isEnvDevelopment);
    }
    return "/";
};
