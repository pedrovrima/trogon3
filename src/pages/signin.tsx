import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Signin() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("No JWT2");
      console.log(status);
    } else if (status === "authenticated") {
      console.log("JWT");
    }
  }, [status]);

  return <div></div>;
}
