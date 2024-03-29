import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";

import { api } from "@/utils/api";

import "@/styles/globals.css";
import Nav from "@/components/organisms/nav";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
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
            <Component {...pageProps} />
          </div>
        </main>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
