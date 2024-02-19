import { type NextPage } from "next";
import { useRouter } from "next/router";

import { api } from "@/utils/api";
import { DataTable, columns } from "@/components/organisms/band_table";
import Loader from "@/components/organisms/loader";

type Query = {
  bandNumber: string;
};

const BandDetails: NextPage = () => {
  const router = useRouter();

  const { bandNumber } = router.query as Query;

  const query = api.test.hello.useQuery(
    { bandNumber },
    { retry: 2, refetchOnWindowFocus: false }
  );

  return (
    <>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          {bandNumber}
        </h1>

        <div className="flex w-full max-w-2xl flex-col items-center gap-2">
          {query.isLoading && <Loader />}
          {query.isError && (
            <>
              <h2 className="text-2xl text-destructive">Erro!</h2>
              <p>{query.error?.message}</p>
            </>
          )}

          {query?.data && "band_captures" in query.data && (
            <>
              {!query?.data?.band_captures[0]?.speciesName ? (
                <p className="text-white">Anilha ainda nao utilizada</p>
              ) : (
                <DataTable columns={columns} data={query.data.band_captures} />
              )}
            </>
          )}

          {/* <AuthShowcase /> */}
        </div>
      </div>
    </>
  );
};

export default BandDetails;
