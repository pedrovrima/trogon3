import { type NextPage } from "next";
import { useRouter } from "next/router";

import { api } from "@/utils/api";
import { DataTable, columns } from "@/components/organisms/band_table";

type Query = {
  bandNumber: string;
};

const BandDetails: NextPage = () => {
  const router = useRouter();

  const { bandNumber } = router.query as Query;
  const hello = api.test.hello.useQuery({ bandNumber });

  return (
    <>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          {bandNumber}
        </h1>

        <div className="flex w-full max-w-2xl flex-col items-center gap-2">
          {hello.isLoading && <p className="text-white">Loading</p>}
          {hello.data && (
            <DataTable columns={columns} data={hello.data.band_captures} />
          )}

          {/* <AuthShowcase /> */}
        </div>
      </div>
    </>
  );
};

export default BandDetails;
