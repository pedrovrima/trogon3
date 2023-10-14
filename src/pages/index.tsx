import { type NextPage } from "next";
import Head from "next/head";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

type AuthPage = NextPage & { auth: boolean };

const Home: AuthPage = () => {
  return (
    <>
      <Head>
        <title>Trogon 3</title>
        <meta name="description" content="Trogon DataSystem - by OAMa" />
      </Head>
      <Button
        onClick={async () => {
          await signOut();
        }}
      >
        {" "}
        Sing out{" "}
      </Button>
    </>
  );
};

Home.auth = true;

export default Home;
