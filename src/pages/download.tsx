import { type NextPage } from "next";
import { useRef } from "react";
import { api } from "@/utils/api";
import Loader from "@/components/organisms/loader";
import { Button } from "@/components/ui/button";
import { CSVLink } from "react-csv";

const Captures: NextPage = () => {
  const { data } = api.captures.getCaptures.useQuery();
  const { data: effortData } = api.efforts.getEfforts.useQuery();

  const downloadRef = useRef(null);
  const effortDownloadRef = useRef(null);

  return (
    <>
      <h1 className="m-8 text-center text-2xl font-bold">Download de dados</h1>
      {data && effortData ? (
        <div className=" flex flex-col items-center justify-center gap-8">
          <>
            <Button
              className="w-96"
              onClick={() => {
                if (downloadRef?.current) {
                  //@ts-expect-error: I don't know how to fix this
                  downloadRef.current.link.click();
                }
              }}
            >
              Download Captura
            </Button>
            <CSVLink
              data={data}
              filename={"captures.csv"}
              className="hidden"
              target="_blank"
              ref={downloadRef}
            />
          </>
          <>
            <Button
              className="w-96"
              onClick={() => {
                if (effortDownloadRef?.current) {
                  //@ts-expect-error: I don't know how to fix this
                  effortDownloadRef.current.link.click();
                }
              }}
            >
              Download Esforço
            </Button>
            <CSVLink
              data={effortData}
              filename={"effort.csv"}
              className="hidden"
              target="_blank"
              ref={effortDownloadRef}
            />
          </>
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Captures;
