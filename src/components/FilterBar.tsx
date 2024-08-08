import {
    ActionIcon,
    Button,
    Divider,
    Flex,
    Group,
    Modal,
    NumberInput,
    Select,
    type SelectProps,
    TagsInput,
    Text,
    TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
    IconAdjustments,
    IconCurrencyDollar,
    IconStarHalf,
} from "@tabler/icons-react";
import { useRef } from "react";

import useGeoAutocomplete, {
    type GeoAutocompleteOptions,
} from "~/hooks/useGeoAutocomplete";
import { InterestType } from "~/types/interests";

export const FILTER_BAR_HEIGHT = "75px";

// TODO: Make generic across app
export interface GeoStringFilters {
    neighborhood: string;
    city: string;
    country: string;
}

export interface SearchFilters {
    location: string;
    maxPrice: string | null;
    flexibleDate: number | null;
    dates: [Date | null, Date | null];
    poiInterests: Array<InterestType>;
    poiMinRating: string | null;
    poiMinReviews: string | null;
}

export const filtersToGeoString = (filters: GeoStringFilters): string =>
    [filters.neighborhood, filters.city, filters.country]
        .filter((value: unknown) => value)
        .filter((value: string) => value.length > 0)
        .join(", ");

const geoAutoCompleteToFilters = (
    autocomplete: GeoAutocompleteOptions
): Array<GeoStringFilters> =>
    autocomplete.map((option) => ({
        neighborhood: ["district", "locality"].includes(option.type)
            ? option.name
            : "",
        city: option.type === "city" ? option.name : option.city || "",
        country: option.country,
    }));

interface ISearchFormProps {
    onSubmit: (_: SearchFilters) => void;
    values: SearchFilters;
}

const GeoAutocomplete = ({
    handleAutocomplete,
    ...props
}: SelectProps & {
    handleAutocomplete: (_: string) => void;
    onChange: (_: string) => void;
}) => {
    const { onChange, value, ...formProps } = props;
    const autocomplete = useGeoAutocomplete(value || "");
    const locations = geoAutoCompleteToFilters(autocomplete);

    return (
        <Select
            searchable
            searchValue={value || ""}
            withCheckIcon={false}
            onSearchChange={onChange}
            nothingFoundMessage="No location found."
            onOptionSubmit={(label) => handleAutocomplete(label)}
            data={[
                ...new Set(
                    [
                        value as string,
                        ...locations.map((location) =>
                            filtersToGeoString(location)
                        ),
                    ].filter(Boolean)
                ),
            ]}
            {...formProps}
        />
    );
};

const SearchForm = ({ onSubmit, values }: ISearchFormProps) => {
    const form = useForm<SearchFilters>({
        initialValues: {
            ...values,
        },
    });

    const handleAutocomplete = (location: string) => {
        form.setValues({
            location,
        });
    };

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <Flex
                direction={{ base: "column", sm: "row" }}
                gap={{ base: "xl" }}
            >
                <Flex direction="column" flex={1}>
                    <Text fw={700}>Stays</Text>

                    <Divider />

                    <GeoAutocomplete
                        mt="md"
                        key="location"
                        label="Location"
                        placeholder="Mission District, San Francisco, United States"
                        handleAutocomplete={handleAutocomplete}
                        {...form.getInputProps("location")}
                    />

                    <NumberInput
                        mt="md"
                        label="Max Price"
                        placeholder="100"
                        leftSection={<IconCurrencyDollar />}
                        decimalScale={0}
                        min={0}
                        fixedDecimalScale
                        {...form.getInputProps("maxPrice")}
                    />

                    <DatePickerInput
                        mt="md"
                        label="Dates"
                        type="range"
                        {...form.getInputProps("dates")}
                    />

                    <Select
                        mt="md"
                        label="Flexibile Dates"
                        data={[
                            { value: "0", label: "± 1 day" },
                            { value: "3", label: "± 2 days" },
                            { value: "1", label: "± 3 days" },
                            { value: "2", label: "± 7 days" },
                            { value: "6", label: "± 14 days" },
                        ]}
                        clearable
                        {...form.getInputProps("flexibleDate")}
                    />
                </Flex>
                <Flex direction="column" flex={1}>
                    <Text fw={700}>Interests</Text>

                    <Divider />

                    <TagsInput
                        mt="md"
                        renderOption={({ option }) => (
                            <span style={{ textTransform: "capitalize" }}>
                                {option.value}
                            </span>
                        )}
                        data={Object.values(InterestType)}
                        {...form.getInputProps("poiInterests")}
                    />

                    <NumberInput
                        mt="md"
                        label="Minimum Rating"
                        placeholder="4 / 5"
                        leftSection={<IconStarHalf />}
                        decimalScale={1}
                        max={5}
                        min={0}
                        fixedDecimalScale
                        {...form.getInputProps("poiMinRating")}
                    />

                    <NumberInput
                        mt="md"
                        label="Minimum Reviews"
                        placeholder="5 reviews"
                        leftSection={<IconStarHalf />}
                        decimalScale={0}
                        min={0}
                        fixedDecimalScale
                        {...form.getInputProps("poiMinReviews")}
                    />
                </Flex>
            </Flex>

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
            <Modal
                opened={opened}
                onClose={close}
                title="Search"
                size="xl"
                centered
            >
                <SearchForm onSubmit={handleSubmit} values={values} />
            </Modal>

            <Flex
                id="filter-bar"
                style={{
                    flex: 1,
                }}
                onClick={() => {
                    ref.current?.blur();
                    open();
                }}
            >
                <TextInput
                    w="100%"
                    label="Location"
                    value={values.location}
                    readOnly
                    ref={ref}
                    onChange={() => ({})}
                    rightSection={
                        <ActionIcon variant="filled">
                            <IconAdjustments />
                        </ActionIcon>
                    }
                />
            </Flex>
        </Flex>
    );
};

export default FilterBar;
