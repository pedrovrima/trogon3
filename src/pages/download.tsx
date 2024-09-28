import { type NextPage } from "next";
import { useRef } from "react";
import { api } from "@/utils/api";
import Loader from "@/components/organisms/loader";
import { Button } from "@/components/ui/button";
import { CSVLink } from "react-csv";

const Captures: NextPage = () => {
  const { data } = api.captures.getCaptures.useQuery();
  const { data: effortData } = api.efforts.getEfforts.useQuery();
  const { data: bandsData } = api.bands.getBandReport.useQuery();
  const { data: hummerData } = api.captures.getCaptures.useQuery({
    family: "Trochilidae",
  });

  console.log(bandsData);

  const downloadRef = useRef(null);
  const effortDownloadRef = useRef(null);
  const bandsDownloadRef = useRef(null);
  const hummerDownloadRef = useRef(null);
  return (
    <>
      <h1 className="m-8 text-center text-2xl font-bold italic">
        Download de dados
      </h1>
      {data && effortData && bandsData && hummerData ? (
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
              filename={`captures_${Date.now()}.csv`}
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
              filename={`effort_${Date.now()}.csv`}
              className="hidden"
              target="_blank"
              ref={effortDownloadRef}
            />
          </>
          <>
            <Button
              className="w-96"
              onClick={() => {
                if (bandsDownloadRef?.current) {
                  //@ts-expect-error: I don't know how to fix this
                  bandsDownloadRef.current.link.click();
                }
              }}
            >
              Download Anilhas
            </Button>
            <CSVLink
              data={bandsData}
              filename={`bands_${Date.now()}.csv`}
              className="hidden"
              target="_blank"
              ref={bandsDownloadRef}
            />
          </>
          <>
            <Button
              className="w-96"
              onClick={() => {
                if (hummerDownloadRef?.current) {
                  //@ts-expect-error: I don't know how to fix this
                  hummerDownloadRef.current.link.click();
                }
              }}
            >
              Download Beija-flores
            </Button>
            <CSVLink
              data={hummerData}
              filename={`hummer_${Date.now()}.csv`}
              className="hidden"
              target="_blank"
              ref={hummerDownloadRef}
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
