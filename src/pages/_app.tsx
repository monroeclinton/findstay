import { MantineProvider } from "@mantine/core";
import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    return (
        <SessionProvider session={session}>
            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                    primaryColor: "indigo",
                    primaryShade: { light: 7, dark: 8 },
                }}
            >
                <Component {...pageProps} />
            </MantineProvider>
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
