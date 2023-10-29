import {
    Box,
    Button,
    Card,
    Container,
    Group,
    Image,
    rem,
    SimpleGrid,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
    IconAdjustments,
    IconArrowRight,
    IconNotes,
    IconRoute,
} from "@tabler/icons-react";
import { type GetServerSidePropsContext } from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";

import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { type FindBasePage } from "~/types/next";
import { api } from "~/utils/api";

import classes from "./index.module.css";

interface FeatureProps extends React.ComponentPropsWithoutRef<"div"> {
    icon: React.FC<any>;
    title: string;
    description: string;
}

const Feature = ({
    icon: Icon,
    title,
    description,
    className,
    ...others
}: FeatureProps) => {
    return (
        <div className={classes.feature} {...others}>
            <div className={classes.overlay} />

            <div className={classes.content}>
                <Icon
                    style={{ width: rem(38), height: rem(38) }}
                    className={classes.icon}
                    stroke={1.5}
                />
                <Text fw={700} fz="lg" mb="xs" mt={5}>
                    {title}
                </Text>
                <Text fz="sm">{description}</Text>
            </div>
        </div>
    );
};

const features = [
    {
        icon: IconRoute,
        title: "Distance to your needs",
        description:
            "See how far away Airbnbs are from points of interest like supermarkets, gyms, and laundrymats.",
    },
    {
        icon: IconAdjustments,
        title: "Filter to your likes",
        description:
            "Adjust the search to only show Airbnbs near your interests, above a rating, or below a price.",
    },
    {
        icon: IconNotes,
        title: "Save for future",
        description:
            "Save and track Airbnbs that you want so you can book them when you are ready in the future.",
    },
];

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

            <Header />

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
                        <Button
                            type="submit"
                            rightSection={<IconArrowRight />}
                            loading={createInvoice.isLoading}
                        >
                            Find your stay
                        </Button>
                    </Group>
                </form>
            </Container>
        </>
    );
};

export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    const session = await getSession(context);

    if (session) {
        return {
            redirect: {
                destination: "/search",
                permanent: false,
            },
        };
    }

    return {
        props: { session },
    };
};

export default Home;
