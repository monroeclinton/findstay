import { AppShell, Center, Flex, Title } from "@mantine/core";
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
    { label: "Dashboard", icon: IconHome, link: "/" },
    { label: "Favorites", icon: IconHeart, link: "/favorites" },
    { label: "Settings", icon: IconAdjustments, link: "/settings" },
];

const Side = () => {
    const links = items.map((item) => <Link {...item} key={item.label} />);

    return (
        <AppShell.Navbar
            w={{ base: SIDE_WIDTH }}
            p="md"
            className={classes.navbar}
        >
            <div className={classes.header}>
                <Center>
                    <Title>FindBase</Title>
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
                <UserButton w="100%" />
            </div>
        </AppShell.Navbar>
    );
};

export const SIDE_WIDTH = 260;
export const SIDE_BREAKPOINT = 760;

export default Side;
