import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider, useSession, signIn } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { type ReactNode } from "react";
import { api } from "@/utils/api";

import "@/styles/globals.css";
import Nav from "@/components/organisms/nav";
import { type NextComponentType } from "next";

type ComponentWithAuth = NextComponentType & { auth: boolean };
type pageProps = {
  session: Session | null;
};
type AppProps = {
  Component: ComponentWithAuth;
  pageProps: pageProps;
};

type Props = {
  children: ReactNode;
};

function Auth({ children }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  console.log(status, session);
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    void router.push("/api/auth/signin");
  }

  return <>{children}</>;
}

const MyApp = (props: AppProps) => {
  const {
    Component,
    pageProps: { session, ...pageProps },
  } = props;
  return (
    <>
      <Head>
        <title>Trogon 3</title>
        <meta name="description" content="Trogon DataSystem - by OAMa" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SessionProvider session={session}>
        <main className="justify-top min-h-screen flex-col  items-center bg-gradient-to-b from-background to-[#15162c] ">
          <Nav />
          <div className="py-8 sm:mx-36">
            {Component.auth ? (
              <Auth>
                <Component {...pageProps} />
              </Auth>
            ) : (
              <Component {...pageProps} />
            )}
          </div>
        </main>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
