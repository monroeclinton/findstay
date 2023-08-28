import {
    ActionIcon,
    CopyButton as MantineCopyButton,
    Tooltip,
    type UnstyledButtonProps,
} from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";

interface ButtonProps extends UnstyledButtonProps {
    value: string;
}

const CopyButton = ({ value, ...props }: ButtonProps) => {
    return (
        <MantineCopyButton {...props} value={value} timeout={2000}>
            {({ copied, copy }) => (
                <Tooltip
                    label={copied ? "Copied" : "Copy"}
                    withArrow
                    position="right"
                >
                    <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                        {copied ? (
                            <IconCheck size="1rem" />
                        ) : (
                            <IconCopy size="1rem" />
                        )}
                    </ActionIcon>
                </Tooltip>
            )}
        </MantineCopyButton>
    );
};

export default CopyButton;
