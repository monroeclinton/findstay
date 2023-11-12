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
    onChange: (_: string) => void;
    values: FormValues;
}

const FilterBar = ({ onChange }: IFilterBarProps) => {
    const [queryParams, setQueryParams] = useQueryParams();
    const [search, setSearch] = useState<string | null>(null);
    const [opened, { open, close }] = useDisclosure(false);
    const ref = useRef<HTMLInputElement>(null);

    const handleSubmit = (values: FormValues): void => {
        const query = Object.values(values).join(", ");
        setQueryParams({ q: query });
        setSearch(query);
        onChange(values);
        close();
    };

    useEffect(() => {
        if (queryParams.get("q") && !search) {
            setSearch(queryParams.get("q"));
        }
    }, [search, queryParams]);

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
                    value={search || ""}
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
