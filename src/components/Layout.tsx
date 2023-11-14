import {
    AppShell,
    type AppShellProps,
    Burger,
    Container,
    Flex,
    Group,
    Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

import Side, { SIDE_BREAKPOINT, SIDE_WIDTH } from "~/components/Side";

interface ILayoutProps extends AppShellProps {
    container?: boolean;
}

const Layout = ({ children, container = true, ...props }: ILayoutProps) => {
    const isMobile = useMediaQuery(`(max-width: ${SIDE_BREAKPOINT}px)`);
    const [opened, { toggle }] = useDisclosure();

    const mainChildren = (
        <Flex direction="column" style={{ flex: 1 }} mt="sm">
            {children}
        </Flex>
    );

    return (
        <AppShell
            header={{
                height: isMobile ? 65 : 0,
                collapsed: !isMobile || opened,
            }}
            navbar={{
                width: SIDE_WIDTH,
                breakpoint: SIDE_BREAKPOINT,
                collapsed: { mobile: !opened, desktop: false },
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
                    <Container
                        size="lg"
                        mt="sm"
                        w="100%"
                        style={{ display: "flex" }}
                    >
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
