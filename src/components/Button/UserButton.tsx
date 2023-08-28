import {
    Avatar,
    Box,
    createStyles,
    getStylesRef,
    Group,
    Menu,
    rem,
    UnstyledButton,
    type UnstyledButtonProps,
} from "@mantine/core";
import {
    IconChevronRight,
    IconLogout,
    IconUserCircle,
} from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";

const useStyles = createStyles((theme) => ({
    user: {
        display: "block",
        width: "100%",
        padding: theme.spacing.sm,

        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[8]
                    : theme.colors.gray[0],

            [`& .${getStylesRef("icon")}`]: {
                color: theme.colorScheme === "dark" ? theme.white : theme.black,
            },
        },
    },

    userIcon: {
        ref: getStylesRef("icon"),
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[2]
                : theme.colors.gray[6],
    },
}));

interface UserButtonProps extends UnstyledButtonProps {
    icon?: React.ReactNode;
}

const UserButton = ({ icon, ...others }: UserButtonProps) => {
    const { classes } = useStyles();
    const { data: sessionData } = useSession();

    return (
        <Menu
            width={250}
            transitionProps={{ transition: "rotate-right", duration: 100 }}
            position="right-end"
        >
            <Menu.Target>
                <UnstyledButton className={classes.user} {...others}>
                    <Group>
                        {sessionData?.user.image && (
                            <Avatar src={sessionData.user.image} radius="xl" />
                        )}
                        {!sessionData?.user.image && (
                            <Avatar radius="xl">
                                <IconUserCircle className={classes.userIcon} />
                            </Avatar>
                        )}

                        <Box ml="auto">
                            {icon || (
                                <IconChevronRight
                                    className={classes.userIcon}
                                    stroke={1.5}
                                />
                            )}
                        </Box>
                    </Group>
                </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Application</Menu.Label>
                <Menu.Item
                    color="red"
                    icon={<IconLogout size={rem(14)} />}
                    onClick={() => void signOut()}
                >
                    Sign Out
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};

export default UserButton;
