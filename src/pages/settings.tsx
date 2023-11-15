import {
    Alert,
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
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconExclamationCircle } from "@tabler/icons-react";
import Head from "next/head";
import { type Session } from "next-auth";
import { signIn, useSession } from "next-auth/react";

import Layout from "~/components/Layout";
import { type FindStayPage } from "~/types/next";
import { api } from "~/utils/api";

interface FormValues {
    name: string;
    email: string;
}

const SettingsForm = ({ sessionData }: { sessionData: Session }) => {
    const updateUser = api.user.update.useMutation();
    const deleteUser = api.user.delete.useMutation();

    const form = useForm<FormValues>({
        initialValues: {
            name: sessionData.user.name || "",
            email: sessionData.user.email || "",
        },
        validate: {
            name: (value) => (value ? null : "Invalid name"),
            email: (value) => {
                return value && /^\S+@\S+\.\S+$/.test(value)
                    ? null
                    : "Invalid email";
            },
        },
    });

    const handleSubmit = (values: { name: string; email: string }): void => {
        updateUser.mutate(values, {
            onSuccess: () =>
                notifications.show({
                    title: "Updated account",
                    message: "Your changes have been saved.",
                }),
        });
    };

    const deleteModal = () =>
        modals.openConfirmModal({
            title: "Please confirm",
            children: (
                <Text size="sm">
                    This will <b>delete</b> your account and is irreversible.
                </Text>
            ),
            confirmProps: { color: "red" },
            labels: {
                confirm: "Delete account",
                cancel: "No, don't delete it",
            },
            onConfirm: () =>
                deleteUser.mutate(undefined, {
                    onSuccess: () => void signIn(),
                }),
        });

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

            <Divider my="lg" />

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

            <Divider my="lg" />

            <Alert
                variant="light"
                color="red"
                title="Delete account"
                icon={<IconExclamationCircle />}
            >
                This will delete your account and is unable to be reversed.
                <Group mt="md">
                    <Button bg="red" onClick={deleteModal}>
                        Delete
                    </Button>
                </Group>
            </Alert>
        </Paper>
    );
};

const Settings: FindStayPage = () => {
    const { status, data: sessionData } = useSession();

    return (
        <>
            <Head>
                <title>FindStay - Settings</title>
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

Settings.authRequired = true;

export default Settings;
