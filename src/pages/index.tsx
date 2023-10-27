import { Button, Container, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowRight } from "@tabler/icons-react";
import Head from "next/head";

import { type FindBasePage } from "~/types/next";
import { api } from "~/utils/api";

const Home: FindBasePage = () => {
    const createInvoice = api.invoice.create.useMutation({
        onSuccess: (data) => {
            window.location.href = data.url;
        },
    });

    const form = useForm({
        initialValues: {
            email: "",
        },

        validate: {
            email: (value) =>
                /^\S+@\S+\.\S+$/.test(value) ? null : "Invalid email",
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
                <form
                    onSubmit={form.onSubmit((values) =>
                        createInvoice.mutate({
                            email: values.email,
                        })
                    )}
                >
                    <TextInput
                        label="Your email"
                        {...form.getInputProps("email")}
                        onBlur={() => form.validate()}
                    />

                    <Group mt="md">
                        <Button type="submit" rightSection={<IconArrowRight />}>
                            Find your stay
                        </Button>
                    </Group>
                </form>
            </Container>
        </>
    );
};

export default Home;
