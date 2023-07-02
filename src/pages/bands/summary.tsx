import { type NextPage } from "next";

import { api } from "@/utils/api";
import Loader from "@/components/organisms/loader";
import {
  BandSummaryTable,
  columns,
} from "@/components/organisms/band_summary_table";

const BandDetails: NextPage = () => {
  const summary = api.bands.getBandCount.useQuery(undefined, {
    retry: 0,
    refetchOnWindowFocus: false,
  });

  console.log(summary);
  return (
    <>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Súmario de anilhas
        </h1>

        <div className="flex w-full max-w-2xl flex-col items-center gap-2">
          {summary.isLoading && <Loader />}
          {summary.isError && (
            <>
              <h2 className="text-2xl text-destructive">Erro!</h2>
              <p>{summary.error?.message}</p>
            </>
          )}

          {summary.isSuccess && (
            <BandSummaryTable columns={columns} data={summary.data} />
          )}

          {/* <AuthShowcase /> */}
        </div>
      </div>
    </>
  );
};

export default BandDetails;
