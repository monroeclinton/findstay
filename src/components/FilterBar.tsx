import {
    ActionIcon,
    Button,
    Flex,
    Group,
    Modal,
    NumberInput,
    Select,
    type SelectProps,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconAdjustments, IconCurrencyDollar } from "@tabler/icons-react";
import { useRef, useState } from "react";

import useGeoAutocomplete, {
    type GeoAutocompleteOptions,
} from "~/hooks/useGeoAutocomplete";

export const FILTER_BAR_HEIGHT = "75px";

// TODO: Make generic across app
export interface GeoStringFilters {
    neighborhood: string;
    city: string;
    country: string;
}

export interface SearchFilters extends GeoStringFilters {
    priceMax: string | null;
}

export const filtersToGeoString = (filters: GeoStringFilters): string =>
    [filters.neighborhood, filters.city, filters.country]
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
    autocomplete,
    handleAutocomplete,
    ...props
}: SelectProps & {
    autocomplete: GeoAutocompleteOptions;
    handleAutocomplete: (_: GeoStringFilters) => void;
}) => {
    const locations = geoAutoCompleteToFilters(autocomplete);

    const map = locations.map((location) => ({
        label: filtersToGeoString(location),
        value: location,
    }));

    return (
        <Select
            onOptionSubmit={(label) => {
                const location = map.find((option) => option.label === label);
                if (location) handleAutocomplete(location.value);
            }}
            data={[
                ...new Set([
                    props.value as string,
                    ...locations.map((location) =>
                        filtersToGeoString(location)
                    ),
                ]),
            ]}
            {...props}
        />
    );
};

const SearchForm = ({ onSubmit, values }: ISearchFormProps) => {
    const form = useForm<SearchFilters>({
        initialValues: values,
    });

    const autocomplete = useGeoAutocomplete(filtersToGeoString(form.values));

    const handleAutocomplete = (filters: GeoStringFilters) => {
        form.setValues(filters);
    };

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <GeoAutocomplete
                key="neighborhood"
                label="Neighborhood"
                placeholder="Mission District"
                maxLength={30}
                autocomplete={autocomplete}
                handleAutocomplete={handleAutocomplete}
                {...form.getInputProps("neighborhood")}
            />

            <GeoAutocomplete
                mt="md"
                withAsterisk
                key="city"
                label="City"
                placeholder="San Francisco"
                required={true}
                autocomplete={autocomplete}
                handleAutocomplete={handleAutocomplete}
                {...form.getInputProps("city")}
            />

            <GeoAutocomplete
                mt="md"
                withAsterisk
                key="country"
                label="Country"
                placeholder="United States"
                required={true}
                autocomplete={autocomplete}
                handleAutocomplete={handleAutocomplete}
                {...form.getInputProps("country")}
            />

            <NumberInput
                mt="md"
                label="Max Price"
                placeholder="100"
                leftSection={<IconCurrencyDollar />}
                decimalScale={0}
                fixedDecimalScale
                {...form.getInputProps("priceMax")}
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
                    value={filtersToGeoString(values)}
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
