import {
    type NextComponentType,
    type NextPage,
    type NextPageContext,
} from "next";
import { type AppProps } from "next/app";
import { type Session } from "next-auth";

export type FindStayPage<P = any, IP = P> = NextPage<P, IP> & {
    authRequired?: boolean;
};

export type FindStayComponent = NextComponentType<
    NextPageContext,
    any,
    object
> &
    Partial<FindStayPage>;

export type FindStayAppProps<P = object> = AppProps<
    P & { session: Session | null }
> & {
    Component: FindStayComponent;
};
