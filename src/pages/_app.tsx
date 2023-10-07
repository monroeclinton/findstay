import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "ol/ol.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import AuthGuard from "../components/AuthGuard";

const MyApp: AppType<{ session: Session | null }> = ({
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
                <Notifications />
                <AuthGuard>
                    <Component {...pageProps} />
                </AuthGuard>
            </MantineProvider>
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
