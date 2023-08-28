import { Center, createStyles, Navbar, Title } from "@mantine/core";
import { IconAdjustments, IconHome } from "@tabler/icons-react";

import UserButton from "~/components/Button/UserButton";
import Link from "~/components/Side/Link";

interface Item {
    label: string;
    icon: React.FC<any>;
    link: string;
}

const items: Item[] = [
    { label: "Dashboard", icon: IconHome, link: "/" },
    { label: "Settings", icon: IconAdjustments, link: "/settings" },
];

const useStyles = createStyles((theme) => ({
    navbar: {
        background:
            theme.colorScheme === "dark"
                ? theme.colors.gray[1]
                : theme.colors.gray[1],
    },

    header: {
        padding: theme.spacing.md,
        marginBottom: `calc(${theme.spacing.md} * 1.5)`,
    },

    footer: {
        paddingTop: theme.spacing.md,
        marginTop: theme.spacing.md,
    },
}));

const Side = () => {
    const { classes } = useStyles();

    const links = items.map((item) => <Link {...item} key={item.label} />);

    return (
        <Navbar width={{ base: SIDE_WIDTH }} p="md" className={classes.navbar}>
            <Navbar.Section className={classes.header}>
                <Center>
                    <Title>FindBase</Title>
                </Center>
            </Navbar.Section>

            <Navbar.Section grow>{links}</Navbar.Section>

            <Navbar.Section className={classes.footer}>
                <UserButton />
            </Navbar.Section>
        </Navbar>
    );
};

export const SIDE_WIDTH = 260;
export const SIDE_BREAKPOINT = 760;

export default Side;
