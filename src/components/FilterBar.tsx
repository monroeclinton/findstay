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
    const [searchParams, setQueryParams] = useQueryParams();
    const [initalized, setInitialized] = useState(false);

    const form = useForm<FormValues>({
        initialValues: {
            neighborhood: "",
            city: "",
            country: "",
        },
    });

    const handleSubmit = (values: FormValues) => {
        setQueryParams(values);
        onSubmit(values);
    };

    useEffect(() => {
        if (initalized || searchParams === null) return;

        const values = Object.keys(form.values)
            .filter(
                (key) =>
                    form.values[key as keyof FormValues].length === 0 &&
                    searchParams.get(key)?.length
            )
            .reduce(
                (o, key) => Object.assign(o, { [key]: searchParams.get(key) }),
                form.values
            );

        form.setValues(values);

        setInitialized(true);
    }, [form, searchParams, initalized]);

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
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
    onChange: (_: string) => void;
}

const FilterBar = ({ onChange }: IFilterBarProps) => {
    const [search, setSearch] = useState("");
    const [opened, { open, close }] = useDisclosure(false);
    const ref = useRef<HTMLInputElement>(null);

    const handleSubmit = (values: FormValues): void => {
        const query = Object.values(values)
            .filter((value: string) => value.length > 0)
            .join(", ");
        onChange(query);
        setSearch(query);
        close();
    };

    return (
        <Flex
            style={{
                height: FILTER_BAR_HEIGHT,
                width: "100%",
            }}
        >
            <Modal opened={opened} onClose={close} title="Search" centered>
                <SearchForm onSubmit={handleSubmit} />
            </Modal>

            <Flex
                style={{
                    flex: 1,
                }}
            >
                <TextInput
                    w="100%"
                    label="Location"
                    value={search}
                    readOnly
                    ref={ref}
                    onChange={() => ({})}
                    onFocus={() => {
                        ref.current?.blur();
                        open();
                    }}
                />
            </Flex>
        </Flex>
    );
};

export default FilterBar;
