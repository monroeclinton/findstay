import { AppShell } from "@mantine/core";

import Side from "~/components/Side";

export interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <AppShell
            styles={{
                main: {
                    display: "flex",
                    flexDirection: "column",
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingRight: 0,
                },
            }}
            navbar={<Side />}
        >
            {children}
        </AppShell>
    );
};

export default Layout;
