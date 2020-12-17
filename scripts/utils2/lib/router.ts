export const routers: ROUTER.router[] = [
    {
        path: "/test",
        component: "@/layouts/baseLayout",
        routes: [
            {
                path: "/test/home",
                exact: true,
                name: "Home",
                component: "@/pages/home",
            },
            {
                path: "/test/start",
                exact: true,
                name: "Start",
                component: "@/pages/start",
            },
            {
                path: "/test/about",
                exact: true,
                name: "About",
                component: "@/pages/about",
            },
            {
                path: "/test/redux",
                exact: true,
                name: "Redux",
                component: "@/pages/redux",
            },
            {
                path: "/test/drag",
                exact: true,
                name: "Drag",
                component: "@/pages/drag",
            },
            {
                path: "/test/slide",
                exact: true,
                name: "Slide",
                component: "@/pages/slide",
            },
            {
                path: "/test/slideDemo2",
                exact: true,
                name: "Demo2",
                component: "@/pages/slideDemo2",
            },
            {
                path: "/test/infinite",
                exact: true,
                name: "Infinite",
                component: "@/pages/infinite",
            },
            {
                exact: true,
                name: "Chose",
                path: "/test/chose",
                component: "@/pages/chose",
            },
            {
                path: "/test/modal",
                exact: true,
                name: "Modal",
                component: "@/pages/modal",
            },
            {
                path: "/",
                redirect: "/test/home",
            },
        ],
    },
    {
        path: "/",
        redirect: "/test/home",
    },
];
