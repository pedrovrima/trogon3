import { type NextPage } from "next";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import { useState } from "react";

const Download: NextPage = () => {
  const utils = api.useContext();
  const [loading, setLoading] = useState<string | null>(null);

  const downloadData = async (type: string) => {
    try {
      setLoading(type);
      let data;
      switch (type) {
        case "boaAnalysis":
          data = await utils.captures.getCaptures.fetch({
            stationString: "BOA",
            analysis: true,
          });
          break;
        case "boaCount":
          data = await utils.species.getSpeciesSummary.fetch({
            stationString: "BOA",
            analysis: true,
          });
          break;
        case "captures":
          data = await utils.captures.getCaptures.fetch({
            stationString: "BOA",
            analysis: true,
          });
          break;
        case "effort":
          data = await utils.efforts.getEfforts.fetch();
          break;
        case "bands":
          data = await utils.bands.getBandReport.fetch();
          break;
        case "hummer":
          data = await utils.captures.getCaptures.fetch({
            family: "Trochilidae",
          });
          break;
        default:
          throw new Error("Invalid download type");
      }

      // Convert data to CSV
      const csvContent = convertToCSV(data);

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${type}_${Date.now()}.csv`);
    } catch (error) {
      console.error("Download failed:", error);
      // You might want to add error handling/notification here
    } finally {
      setLoading(null);
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data?.length) return "";

    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers
        .map((header) => {
          const cell = row[header];
          // Handle cells that might contain commas or quotes
          return typeof cell === "string" &&
            (cell.includes(",") || cell.includes('"'))
            ? `"${cell.replace(/"/g, '""')}"`
            : cell;
        })
        .join(",")
    );

    return [headers.join(","), ...rows].join("\n");
  };

  return (
    <>
      <h1 className="m-8 text-center text-2xl font-bold italic">
        Download de dados
      </h1>

      <div className="flex flex-col items-center justify-center gap-8">
        <Button
          className="w-96"
          onClick={() => void downloadData("boaAnalysis")}
          disabled={loading === "boaAnalysis"}
        >
          {loading === "boaAnalysis" ? "Carregando..." : "Download Análise BOA"}
        </Button>

        <Button
          className="w-96"
          onClick={() => void downloadData("boaCount")}
          disabled={loading === "boaCount"}
        >
          {loading === "boaCount"
            ? "Carregando..."
            : "Download Contagem SPP BOA"}
        </Button>

        <Button
          className="w-96"
          onClick={() => void downloadData("captures")}
          disabled={loading === "captures"}
        >
          {loading === "captures" ? "Carregando..." : "Download Captura"}
        </Button>

        <Button
          className="w-96"
          onClick={() => void downloadData("effort")}
          disabled={loading === "effort"}
        >
          {loading === "effort" ? "Carregando..." : "Download Esforço"}
        </Button>

        <Button
          className="w-96"
          onClick={() => void downloadData("bands")}
          disabled={loading === "bands"}
        >
          {loading === "bands" ? "Carregando..." : "Download Anilhas"}
        </Button>

        <Button
          className="w-96"
          onClick={() => void downloadData("hummer")}
          disabled={loading === "hummer"}
        >
          {loading === "hummer" ? "Carregando..." : "Download Beija-flores"}
        </Button>
      </div>
    </>
  );
};

export default Download;
