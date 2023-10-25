import Head from "next/head";

import { type FindBasePage } from "~/types/next";

const Home: FindBasePage = () => {
    return (
        <>
            <Head>
                <title>FindBase - Find your perfect stay</title>
                <meta name="description" content="Find the perfect stay." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
        </>
    );
};

export default Home;
