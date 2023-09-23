import { AppShell } from "@mantine/core";

import Side, { SIDE_BREAKPOINT, SIDE_WIDTH } from "~/components/Side";

export interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <AppShell
            navbar={{
                width: SIDE_WIDTH,
                breakpoint: SIDE_BREAKPOINT,
            }}
            styles={{
                main: {
                    display: "flex",
                    flexDirection: "column",
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingRight: 0,
                },
            }}
        >
            <Side />
            <AppShell.Main ml="sm">{children}</AppShell.Main>
        </AppShell>
    );
};

export default Layout;
