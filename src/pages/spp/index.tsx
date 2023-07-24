import { type NextPage } from "next";

import { api } from "@/utils/api";
import Loader from "@/components/organisms/loader";
import { BandersTable, columns } from "@/components/organisms/banders_table";

const SppDetails: NextPage = () => {
  const spp = api.spp.getSppSummary.useQuery(undefined, {
    retry: 0,
    refetchOnWindowFocus: false,
  });

  console.log(spp);
  return (
    <>SPP</>
    // <>
    //   <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
    //     <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
    //       Pessoas Anilhadoras Cadastradas
    //     </h1>

    //     <div className="flex w-full max-w-4xl flex-col items-center gap-2">
    //       {banders.isLoading && <Loader />}
    //       {banders.isError && (
    //         <>
    //           <h2 className="text-2xl text-destructive">Erro!</h2>
    //           <p>{banders.error?.message}</p>
    //         </>
    //       )}

    //       {banders.isSuccess && (
    //         <BandersTable columns={columns} data={banders.data} />
    //       )}
    //     </div>
    //   </div>
    // </>
  );
};

export default SppDetails;
