import {
    Box,
    createStyles,
    getStylesRef,
    Text,
    ThemeIcon,
} from "@mantine/core";
import classNames from "classnames";
import NextLink from "next/link";
import { useRouter } from "next/router";

interface LinkProps {
    icon: React.FC<any>;
    label: string;
    link: string;
}

const useStyles = createStyles((theme) => ({
    link: {
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        fontSize: theme.fontSizes.md,
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[1]
                : theme.colors.gray[7],
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        fontWeight: 500,

        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
            color: theme.colorScheme === "dark" ? theme.white : theme.black,

            [`& .${getStylesRef("icon")}`]: {
                color: theme.colorScheme === "dark" ? theme.white : theme.black,
            },
        },
    },

    linkIcon: {
        ref: getStylesRef("icon"),
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[2]
                : theme.colors.gray[6],
    },

    linkActive: {
        "&, &:hover": {
            color: theme.fn.variant({
                variant: "light",
                color: theme.primaryColor,
            }).color,
            [`& .${getStylesRef("icon")}`]: {
                color: theme.fn.variant({
                    variant: "light",
                    color: theme.primaryColor,
                }).color,
            },
        },
    },
}));

const Link = ({ icon: Icon, label, link }: LinkProps) => {
    const { classes } = useStyles();
    const router = useRouter();

    return (
        <Box mt="xs">
            <NextLink
                href={link}
                className={classNames(classes.link, {
                    [classes.linkActive]: link === router.asPath,
                })}
            >
                <ThemeIcon
                    size={30}
                    sx={{ backgroundColor: "transparent" }}
                    radius="lg"
                >
                    <Icon className={classes.linkIcon} stroke={2} />
                </ThemeIcon>
                <Text ml="sm">{label}</Text>
            </NextLink>
        </Box>
    );
};

export default Link;
