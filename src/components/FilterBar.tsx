import { Button, Flex, Group, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useRef } from "react";

export const FILTER_BAR_HEIGHT = "85px";

export interface SearchFilters {
    neighborhood: string;
    city: string;
    country: string;
}

export const filtersToString = (filters: SearchFilters): string =>
    [filters.neighborhood, filters.city, filters.country]
        .filter((value: string) => value.length > 0)
        .join(", ");

interface ISearchFormProps {
    onSubmit: (_: SearchFilters) => void;
    values: SearchFilters;
}

const SearchForm = ({ onSubmit, values }: ISearchFormProps) => {
    const form = useForm<SearchFilters>({
        initialValues: values,
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
    onChange: (_: SearchFilters) => void;
    values: SearchFilters;
}

const FilterBar = ({ onChange, values }: IFilterBarProps) => {
    const [opened, { open, close }] = useDisclosure(false);
    const ref = useRef<HTMLInputElement>(null);

    const handleSubmit = (values: SearchFilters): void => {
        onChange(values);
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
                <SearchForm onSubmit={handleSubmit} values={values} />
            </Modal>

            <Flex
                style={{
                    flex: 1,
                }}
            >
                <TextInput
                    w="100%"
                    label="Location"
                    value={filtersToString(values)}
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
