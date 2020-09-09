import browserslist from "browserslist";

export const checkBrowsers = (dir: string, isInteractive: boolean, retry = true) => {
    //@ts-ignore
    const current = browserslist.loadConfig({ path: dir });
    // browserslist.
    console.log(current);
};
