import {
    Avatar,
    Box,
    type FloatingPosition,
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

import classes from "./UserButton.module.css";

interface UserButtonProps extends UnstyledButtonProps {
    position: FloatingPosition;
    icon?: React.ReactNode;
}

const UserButton = ({ position, icon, ...others }: UserButtonProps) => {
    const { data: sessionData } = useSession();

    return (
        <Menu
            width={250}
            transitionProps={{ transition: "rotate-right", duration: 100 }}
            position={position}
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
                    leftSection={<IconLogout size={rem(14)} />}
                    onClick={() => void signOut()}
                >
                    Sign Out
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};

export default UserButton;
