import { AppShell, type AppShellProps, Container, Flex } from "@mantine/core";

import Side, { SIDE_BREAKPOINT, SIDE_WIDTH } from "~/components/Side";

interface ILayoutProps extends AppShellProps {
    container?: boolean;
}

const Layout = ({ children, container = true, ...props }: ILayoutProps) => {
    const mainChildren = (
        <Flex direction="column" style={{ flex: 1 }} mt="sm">
            {children}
        </Flex>
    );
    return (
        <AppShell
            navbar={{
                width: SIDE_WIDTH,
                breakpoint: SIDE_BREAKPOINT,
            }}
            styles={{
                main: {
                    display: "flex",
                },
            }}
            {...props}
        >
            <Side />
            <AppShell.Main mx="sm">
                {container === true ? (
                    <Container size="lg" mt="sm" w="100%">
                        {mainChildren}
                    </Container>
                ) : (
                    mainChildren
                )}
            </AppShell.Main>
        </AppShell>
    );
};

export default Layout;
