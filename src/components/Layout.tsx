import { AppShell, Container, createStyles } from "@mantine/core";

import Side from "~/components/Side";

export interface LayoutProps {
    children: React.ReactNode;
}

const useStyles = createStyles(() => ({
    container: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
    },
}));

const Layout = ({ children }: LayoutProps) => {
    const { classes } = useStyles();

    return (
        <AppShell padding="md" navbar={<Side />}>
            <Container py="md" className={classes.container}>
                {children}
            </Container>
        </AppShell>
    );
};

export default Layout;
