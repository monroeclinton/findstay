import {
    Button,
    Center,
    Container,
    rem,
    SimpleGrid,
    Text,
    Title,
} from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import Head from "next/head";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { type FindBasePage } from "~/types/next";

const Favorites: FindBasePage = () => {
    return (
        <>
            <Head>
                <title>FindBase - Successful Purchase</title>
                <meta name="description" content="Find the perfect stay." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Container mt="xl">
                <SimpleGrid
                    spacing={{ base: 40, sm: 80 }}
                    cols={{ base: 1, sm: 2 }}
                >
                    <div>
                        <Title>Payment Success!</Title>
                        <Text size="lg" mt="md">
                            Your payment was successful, you can now sign in
                            with the email you used to pay. If you have a
                            problem signing in,{" "}
                            <Link href="/faq#no-login">read the FAQ</Link>.
                        </Text>
                        <Button
                            size="md"
                            mt="xl"
                            onClick={() =>
                                void signIn(undefined, {
                                    callbackUrl: "/search",
                                })
                            }
                        >
                            Sign in
                        </Button>
                    </div>
                    <Center>
                        <IconCircleCheck
                            color="var(--mantine-color-anchor)"
                            style={{ width: rem(120), height: rem(120) }}
                        />
                    </Center>
                </SimpleGrid>
            </Container>
        </>
    );
};

Favorites.authRequired = false;

export default Favorites;
