import { Box, Text, ThemeIcon } from "@mantine/core";
import classNames from "classnames";
import NextLink from "next/link";
import { useRouter } from "next/router";

import classes from "./Link.module.css";

interface LinkProps {
    icon: React.FC<any>;
    label: string;
    link: string;
}

const Link = ({ icon: Icon, label, link }: LinkProps) => {
    const router = useRouter();

    return (
        <Box mt="xs">
            <NextLink
                href={link}
                className={classNames(classes.link, {
                    [classes.linkActive as string]: link === router.asPath,
                })}
            >
                <ThemeIcon
                    size={30}
                    style={{ backgroundColor: "transparent" }}
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
