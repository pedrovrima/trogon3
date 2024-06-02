import { type AppType } from "next/app";

import Head from "next/head";

import { api } from "@/utils/api";

import "@/styles/globals.css";
import Nav from "@/components/organisms/nav";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Trogon 3</title>
        <meta name="description" content="Trogon DataSystem - by OAMa" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="justify-top min-h-screen flex-col  items-center bg-gradient-to-b from-background to-[#15162c] ">
        <Nav />
        <div className="py-8 sm:mx-36">
          <Component {...pageProps} />
        </div>
      </main>
    </>
  );
};

export default api.withTRPC(MyApp);
