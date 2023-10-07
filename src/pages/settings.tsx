import {
    Avatar,
    Button,
    Divider,
    Group,
    Loader,
    Paper,
    Text,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { type NextPage } from "next";
import Head from "next/head";
import { type Session } from "next-auth";
import { useSession } from "next-auth/react";

import Layout from "~/components/Layout";
import { api } from "~/utils/api";

interface FormValues {
    name: string;
    email: string;
}

const SettingsForm = ({ sessionData }: { sessionData: Session }) => {
    const update = api.user.update.useMutation();

    const form = useForm<FormValues>({
        initialValues: {
            name: sessionData.user.name || "",
            email: sessionData.user.email || "",
        },
        validate: {
            name: (value) => (value ? null : "Invalid name"),
            email: (value) => {
                return value && /^\S+@\S+$/.test(value)
                    ? null
                    : "Invalid email";
            },
        },
    });

    const handleSubmit = (values: { name: string; email: string }): void => {
        update.mutate(values, {
            onSuccess: () =>
                notifications.show({
                    title: "Updated account",
                    message: "Your changes have been saved.",
                }),
        });
    };

    return (
        <Paper radius="md" withBorder p="lg" bg="var(--mantine-color-body)">
            {sessionData.user.name ? (
                <Avatar
                    src={sessionData.user.image}
                    size={120}
                    radius={120}
                    mx="auto"
                />
            ) : (
                <Avatar size={120} radius={120} mx="auto" />
            )}
            {sessionData.user.name && (
                <Text ta="center" fz="lg" fw={500} mt="md">
                    {sessionData.user.name}
                </Text>
            )}
            {sessionData.user.email && (
                <Text ta="center" c="dimmed" fz="sm">
                    {sessionData.user.email}
                </Text>
            )}

            <Divider my="md" />

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput
                    withAsterisk
                    label="Name"
                    placeholder="Leif Erikson"
                    maxLength={30}
                    {...form.getInputProps("name")}
                />

                <TextInput
                    mt="md"
                    withAsterisk
                    label="Email"
                    placeholder="your@email.com"
                    {...form.getInputProps("email")}
                />

                <Group mt="md">
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Paper>
    );
};

const Settings: NextPage = () => {
    const { status, data: sessionData } = useSession();

    return (
        <>
            <Head>
                <title>FindBase - Settings</title>
                <meta name="description" content="Find the perfect stay." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout>
                {status !== "authenticated" ? (
                    <Loader />
                ) : (
                    <SettingsForm sessionData={sessionData} />
                )}
            </Layout>
        </>
    );
};

export default Settings;
