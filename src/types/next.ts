import {
    type NextComponentType,
    type NextPage,
    type NextPageContext,
} from "next";
import { type AppProps } from "next/app";
import { type Session } from "next-auth";

export type FindBasePage<P = any, IP = P> = NextPage<P, IP> & {
    authRequired?: boolean;
};

export type FindBaseComponent = NextComponentType<
    NextPageContext,
    any,
    object
> &
    Partial<FindBasePage>;

export type FindBaseAppProps<P = object> = AppProps<
    P & { session: Session | null }
> & {
    Component: FindBaseComponent;
};
