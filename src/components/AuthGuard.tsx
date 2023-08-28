import { Center, Container, Loader } from "@mantine/core";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

interface IAuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<IAuthGuardProps> = ({ children }) => {
    const { status: sessionStatus } = useSession();

    useEffect(() => {
        if (sessionStatus === "unauthenticated") {
            void signIn();
        }
    }, [sessionStatus]);

    if (["loading", "unauthenticated"].includes(sessionStatus)) {
        return (
            <Container>
                <Center h={400}>
                    <Loader />
                </Center>
            </Container>
        );
    }

    return <>{children}</>;
};

export default AuthGuard;
