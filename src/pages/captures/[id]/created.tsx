import { type NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loader from "@/components/organisms/loader";
import { api } from "@/utils/api";

const CaptureCreatedPage: NextPage = () => {
  const router = useRouter();
  const captureId = Number(router.query.id);

  const query = api.captures.getCaptureById.useQuery(
    { captureId: Number.isFinite(captureId) ? captureId : 0 },
    { enabled: Number.isFinite(captureId) }
  );

  if (!Number.isFinite(captureId)) {
    return <p className="p-6 text-white">Captura invalida.</p>;
  }

  if (query.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="p-6 text-white">
        Nao foi possivel carregar a captura criada agora.
      </div>
    );
  }

  const { data } = query;
  const bandLabel = data.bandNumber
    ? `${data.bandSize ?? ""}${data.bandNumber}`
    : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-8">
      <Card className="w-full rounded-none border-[#2d3f64] bg-[#0a1224] text-slate-100 shadow-none">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">
              Captura criada
            </p>
            <h1 className="text-3xl font-semibold text-white">
              Proximo passo
            </h1>
            <p className="text-sm text-slate-300">
              Captura {String(data.captureId).padStart(4, "0")}
              {bandLabel ? ` • Anilha ${bandLabel}` : ""}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild className="h-auto min-h-[72px] justify-start px-5 py-4">
              <Link href="/captures/new">Entrar nova captura</Link>
            </Button>

            <Button
              asChild={Boolean(data.effortId)}
              variant="secondary"
              className="h-auto min-h-[72px] justify-start px-5 py-4"
              disabled={!data.effortId}
            >
              {data.effortId ? (
                <Link href={`/captures/new?effortId=${data.effortId}`}>
                  Entrar nova captura do mesmo esforco
                </Link>
              ) : (
                <span>Entrar nova captura do mesmo esforco</span>
              )}
            </Button>

            <Button asChild variant="outline" className="h-auto min-h-[72px] justify-start border-[#2d3f64] bg-transparent px-5 py-4 text-slate-100 hover:bg-slate-800 hover:text-white">
              <Link href={`/captures/${data.captureId}`}>Ver essa captura</Link>
            </Button>

            <Button
              asChild={Boolean(bandLabel)}
              variant="outline"
              className="h-auto min-h-[72px] justify-start border-[#2d3f64] bg-transparent px-5 py-4 text-slate-100 hover:bg-slate-800 hover:text-white"
              disabled={!bandLabel}
            >
              {bandLabel ? (
                <Link href={`/bands/${bandLabel}`}>
                  Ver outros dados dessa mesma anilha
                </Link>
              ) : (
                <span>Ver outros dados dessa mesma anilha</span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaptureCreatedPage;
