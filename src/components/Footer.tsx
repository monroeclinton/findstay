import { Anchor, Container, Group, Text, Title } from "@mantine/core";

import classes from "./Footer.module.css";

const links = [
    { link: "mailto:support@findstay.io", label: "Support" },
    { link: "https://youtube.com/@monroeprograms", label: "YouTube" },
];

const Footer = () => {
    const items = links.map((link) => (
        <Anchor<"a">
            key={link.label}
            href={link.link}
            onClick={(event) => event.preventDefault()}
            size="sm"
        >
            {link.label}
        </Anchor>
    ));

    return (
        <nav className={classes.footer}>
            <Container className={classes.inner}>
                <Title order={2}>FindStay</Title>

                <Group className={classes.links} ml="auto">
                    {items}
                </Group>
            </Container>

            <Container className={classes.afterFooter}>
                <Text c="dimmed" size="sm" m="auto">
                    © 2023 FindStay. All rights reserved. - Built by{" "}
                    <Anchor href="https://monroeclinton.com">Monroe</Anchor>
                </Text>
            </Container>
        </nav>
    );
};

export default Footer;
