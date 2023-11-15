import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "ol/ol.css";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { SessionProvider } from "next-auth/react";
import React from "react";

import AuthGuard from "~/components/AuthGuard";
import { type FindStayAppProps } from "~/types/next";
import { api } from "~/utils/api";

const MyApp: React.FC<FindStayAppProps> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    return (
        <SessionProvider session={session}>
            <MantineProvider
                theme={{
                    primaryColor: "indigo",
                    primaryShade: { light: 7, dark: 8 },
                }}
            >
                <ModalsProvider>
                    <Notifications />
                    {Component.authRequired ? (
                        <AuthGuard>
                            <Component {...pageProps} />
                        </AuthGuard>
                    ) : (
                        <Component {...pageProps} />
                    )}
                </ModalsProvider>
            </MantineProvider>
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
