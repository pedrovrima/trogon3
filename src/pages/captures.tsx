import { type NextPage } from "next";
import { useRef } from "react";
import { api } from "@/utils/api";
import Loader from "@/components/organisms/loader";
import { Button } from "@/components/ui/button";
import { CSVLink } from "react-csv";

const Captures: NextPage = () => {
  const { data } = api.captures.getCaptures.useQuery();
  const downloadRef = useRef<HTMLAnchorElement>(null);

  return (
    <>
      {data ? (
        <>
          <Button
            onClick={() => {
              if (downloadRef?.current) {
                downloadRef.current.link.click();
              }
            }}
          >
            Download Captures
          </Button>
          <CSVLink
            data={data}
            filename={"captures.csv"}
            className="hidden"
            target="_blank"
            ref={downloadRef}
          />
        </>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Captures;
