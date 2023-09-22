import { Flex, TextInput } from "@mantine/core";

export const FILTER_BAR_HEIGHT = "85px";

interface IFilterBarProps {
    search: string;
    setSearch: (_: string) => void;
}

const FilterBar = ({ search, setSearch }: IFilterBarProps) => {
    return (
        <Flex
            style={{
                height: FILTER_BAR_HEIGHT,
            }}
        >
            <Flex
                my="sm"
                style={{
                    flexBasis: "60%",
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
