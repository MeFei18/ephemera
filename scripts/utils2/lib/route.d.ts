declare namespace ROUTER {
    interface router {
        path: string;
        component?: string | (() => JSX.Element);
        exact?: boolean;
        push?: boolean;
        redirect?: string;
        routes?: router[];
        name?: string;
        icon?: any;
    }

    interface baseRouter {
        routes?: router[];
    }
}
