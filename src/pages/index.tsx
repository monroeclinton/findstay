import { Carousel } from "@mantine/carousel";
import {
    Alert,
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
import { modals } from "@mantine/modals";
import {
    IconAdjustments,
    IconArrowRight,
    IconInfoCircle,
    IconNotes,
    IconRoute,
} from "@tabler/icons-react";
import classNames from "classnames";
import { type GetServerSidePropsContext } from "next";
import Head from "next/head";
import { getSession } from "next-auth/react";

import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { type FindStayPage } from "~/types/next";
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

const Home: FindStayPage = () => {
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
                <title>FindStay - Find your perfect stay</title>
                <meta name="description" content="Find the perfect stay." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header />

            <Container>
                <Title>Find your perfect Airbnb stay</Title>

                <Box py="xl">
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
                    {createInvoice.error?.message && (
                        <Alert
                            mt="md"
                            variant="light"
                            title="Could not sign up"
                            icon={<IconInfoCircle />}
                        >
                            {createInvoice.error?.message}
                        </Alert>
                    )}
                </Box>

                <Box
                    className={classNames(
                        classes.imageContainer,
                        classes.desktop
                    )}
                    p="md"
                    my="xl"
                >
                    <div className={classes.overlay} />
                    <div className={classes.overlay} />

                    <Card shadow="sm" withBorder>
                        <Image
                            src="/assets/search.png"
                            alt="Image of the search page."
                        />
                    </Card>
                </Box>

                <Box
                    className={classNames(
                        classes.imageContainer,
                        classes.mobile
                    )}
                    p="md"
                    my="xl"
                >
                    <div className={classes.overlay} />
                    <div className={classes.overlay} />

                    <Card shadow="sm" withBorder p="sm">
                        <Carousel withIndicators slideGap="sm" slideSize="50%">
                            <Carousel.Slide
                                onClick={() =>
                                    modals.open({
                                        fullScreen: true,
                                        children: (
                                            <Image
                                                src="/assets/search-mobile-listings.png"
                                                alt="Image of the mobile search listings page."
                                            />
                                        ),
                                    })
                                }
                            >
                                <Image
                                    src="/assets/search-mobile-listings.png"
                                    alt="Image of the mobile search listings page."
                                />
                            </Carousel.Slide>
                            <Carousel.Slide
                                onClick={() =>
                                    modals.open({
                                        fullScreen: true,
                                        children: (
                                            <Image
                                                src="/assets/search-mobile-map.png"
                                                alt="Image of the mobile search map page."
                                            />
                                        ),
                                    })
                                }
                            >
                                <Image
                                    src="/assets/search-mobile-map.png"
                                    alt="Image of the mobile search map page."
                                />
                            </Carousel.Slide>
                        </Carousel>
                    </Card>
                </Box>

                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={50} my="xl">
                    {features.map((item) => (
                        <Feature {...item} key={item.title} />
                    ))}
                </SimpleGrid>
            </Container>

            <Footer />
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
