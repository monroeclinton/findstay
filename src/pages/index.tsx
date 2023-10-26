import { Button, Container, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowRight } from "@tabler/icons-react";
import Head from "next/head";

import { type FindBasePage } from "~/types/next";

const Home: FindBasePage = () => {
    const form = useForm({
        initialValues: {
            email: "",
        },

        validate: {
            email: (value) =>
                /^\S+@\S+$/.test(value) ? null : "Invalid email",
        },
    });

    return (
        <>
            <Head>
                <title>FindBase - Find your perfect stay</title>
                <meta name="description" content="Find the perfect stay." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Container>
                <form onSubmit={form.onSubmit((values) => console.log(values))}>
                    <TextInput
                        label="Your email"
                        {...form.getInputProps("email")}
                        onBlur={() => form.validate()}
                    />
                    <Button type="submit" rightSection={<IconArrowRight />}>
                        Find your stay
                    </Button>
                </form>
            </Container>
        </>
    );
};

export default Home;
