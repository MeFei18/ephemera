import React from "react";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";

interface routerProps {
    routes?: ROUTER.router[];
}

const TmpRouter: React.FC<routerProps> = ({ routes }) => {
    if (!routes) {
        return null;
    }

    return (
        <Switch>
            {routes.map((r, i) => {
                const path = r.path;
                const key = `${r.path}_${i}`;
                if (r.component) {
                    const Component = r.component;
                    return (
                        <Route key={key} path={path} exact={r.exact}>
                            {(info: any) => (
                                <Component {...info} routes={r.routes}>
                                    <TmpRouter routes={r.routes} />
                                </Component>
                            )}
                        </Route>
                    );
                } else if (r.redirect) {
                    return (
                        <Redirect
                            key={key}
                            from={path}
                            push={r.push}
                            exact={r.exact}
                            to={r.redirect || "/"}
                        />
                    );
                }
                return <TmpRouter routes={r.routes} key={key} />;
            })}
        </Switch>
    );
};

const Component: React.FC<routerProps> = ({ routes }) => {
    return (
        <BrowserRouter>
            <TmpRouter routes={routes} />
        </BrowserRouter>
    );
};

export default Component;
