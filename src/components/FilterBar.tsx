import { Button, Flex, Group, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";

import { useQueryParams } from "~/hooks/useQueryParams";

export const FILTER_BAR_HEIGHT = "85px";

export interface FormValues {
    neighborhood: string;
    city: string;
    country: string;
}

const SearchForm = ({ onSubmit }: { onSubmit: (_: FormValues) => void }) => {
    const form = useForm<FormValues>({
        initialValues: {
            neighborhood: "",
            city: "",
            country: "",
        },
    });

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <TextInput
                label="Name"
                placeholder="Mission District"
                maxLength={30}
                {...form.getInputProps("neighborhood")}
            />

            <TextInput
                mt="md"
                withAsterisk
                label="City"
                placeholder="San Francisco"
                {...form.getInputProps("city")}
            />

            <TextInput
                mt="md"
                withAsterisk
                label="Country"
                placeholder="United States"
                {...form.getInputProps("country")}
            />

            <Group mt="md">
                <Button type="submit">Search</Button>
            </Group>
        </form>
    );
};

interface IFilterBarProps {
    search: string;
    setSearch: (_: string) => void;
}

const FilterBar = ({ search, setSearch }: IFilterBarProps) => {
    return (
        <Flex
            style={{
                height: FILTER_BAR_HEIGHT,
                width: "100%",
            }}
        >
            <Flex
                style={{
                    flex: 1,
                }}
            >
                <TextInput
                    w="100%"
                    label="Location"
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                />
            </Flex>
        </Flex>
    );
};

export default FilterBar;
