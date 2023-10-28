import { Button, Container, Title } from "@mantine/core";
import { signIn } from "next-auth/react";

import classes from "./Header.module.css";

const Header = () => {
    return (
        <header className={classes.header}>
            <Container size="md" className={classes.inner}>
                <Title order={2}>FindBase</Title>

                <Button
                    ml="auto"
                    onClick={() =>
                        void signIn(undefined, { callbackUrl: "/search" })
                    }
                >
                    Sign In
                </Button>
            </Container>
        </header>
    );
};

export default Header;
