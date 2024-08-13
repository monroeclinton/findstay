import { AppShell, Center, CloseButton, Flex, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconAdjustments, IconHeart, IconHome } from "@tabler/icons-react";

import UserButton from "~/components/Button/UserButton";
import Link from "~/components/Side/Link";

import classes from "./Side.module.css";

interface Item {
    label: string;
    icon: React.FC<any>;
    link: string;
}

const items: Item[] = [
    { label: "Search", icon: IconHome, link: "/search" },
    { label: "Favorites", icon: IconHeart, link: "/favorites" },
    { label: "Settings", icon: IconAdjustments, link: "/settings" },
];

const Side = ({ toggleHeader }: { toggleHeader: () => void }) => {
    const isMobile = useMediaQuery(`(max-width: ${SIDE_BREAKPOINT}px)`);
    const links = items.map((item) => <Link {...item} key={item.label} />);

    return (
        <AppShell.Navbar p="md" className={classes.navbar}>
            {isMobile && (
                <CloseButton size="xl" ml="auto" onClick={toggleHeader} />
            )}

            <div className={classes.header}>
                <Center>
                    <Title>FindStay</Title>
                </Center>
            </div>

            <Flex
                direction="column"
                style={{
                    flexGrow: 1,
                }}
            >
                {links}
            </Flex>

            <div className={classes.footer}>
                <UserButton
                    w="100%"
                    position={isMobile ? "top-start" : "right-end"}
                />
            </div>
        </AppShell.Navbar>
    );
};

export const SIDE_WIDTH = 260;
export const SIDE_BREAKPOINT = 760;

export default Side;
