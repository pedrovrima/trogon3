import { type NextPage } from "next";
import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import Loader from "@/components/organisms/loader";

type NetEntry = {
  netId: number;
  netNumber: string;
  openCloseTimes: { openTime: string; closeTime: string }[];
};

type EffortVariableEntry = {
  effortVariableId: number;
  effortTimeId: number;
  type: "categorical" | "continuous";
  optionId?: number;
  value?: string;
};

// ── Section wrapper ──

function Section({
  title,
  enabled,
  children,
  sectionRef,
}: {
  title: string;
  enabled: boolean;
  children: React.ReactNode;
  sectionRef?: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div
      ref={sectionRef}
      className={`scroll-mt-4 rounded-md p-6 transition-opacity ${
        enabled ? "bg-slate-700" : "pointer-events-none bg-slate-800 opacity-40"
      }`}
    >
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

const NewEffortPage: NextPage = () => {
  const router = useRouter();

  // Section refs
  const sectionRefs = {
    basic: useRef<HTMLDivElement>(null!),
    nets: useRef<HTMLDivElement>(null!),
    variables: useRef<HTMLDivElement>(null!),
    summary: useRef<HTMLDivElement>(null!),
  };

  // Section 1: Base info
  const [dateEffort, setDateEffort] = useState("");
  const [stationId, setStationId] = useState<number | null>(null);
  const [protocolId, setProtocolId] = useState<number | null>(null);

  // Section 2: Nets
  const [nets, setNets] = useState<NetEntry[]>([]);
  const [globalOpen, setGlobalOpen] = useState("");
  const [globalClose, setGlobalClose] = useState("");

  // Section 3: Variables
  const [variableEntries, setVariableEntries] = useState<
    EffortVariableEntry[]
  >([]);

  // Section 4: Summary
  const [newBands, setNewBands] = useState(0);
  const [recapture, setRecapture] = useState(0);
  const [unbanded, setUnbanded] = useState(0);
  const [notes, setNotes] = useState("");

  // Queries
  const stations = api.captures.getStations.useQuery();
  const protocols = api.efforts.getProtocols.useQuery();
  const stationNets = api.efforts.getNetsByStation.useQuery(
    { stationId: stationId! },
    { enabled: !!stationId }
  );
  const effortVars = api.efforts.getEffortVariables.useQuery();

  const createEffort = api.efforts.createEffort.useMutation({
    onSuccess: (data) => {
      void router.push(`/efforts/${data.effortId}`);
    },
  });

  // ── Combobox option lists ──

  const stationOptions: ComboboxOption[] = useMemo(
    () =>
      (stations.data ?? []).map((s) => ({
        value: Number(s.stationId),
        label: `${s.stationCode} - ${s.stationName}`,
      })),
    [stations.data]
  );

  const protocolOptions: ComboboxOption[] = useMemo(
    () =>
      (protocols.data ?? []).map((p) => ({
        value: Number(p.protocolId),
        label: p.protocolCode,
      })),
    [protocols.data]
  );

  // ── Net helpers ──

  const availableNets = stationNets.data ?? [];

  const toggleNet = (netId: number, netNumber: string) => {
    setNets((prev) => {
      const existing = prev.find((n) => n.netId === netId);
      if (existing) {
        return prev.filter((n) => n.netId !== netId);
      }
      return [
        ...prev,
        {
          netId,
          netNumber,
          openCloseTimes: [{ openTime: globalOpen, closeTime: globalClose }],
        },
      ];
    });
  };

  const selectAllNets = () => {
    const realNets = availableNets.filter((n) => n.netNumber !== "NA");
    setNets(
      realNets.map((n) => ({
        netId: Number(n.netId),
        netNumber: n.netNumber,
        openCloseTimes: [{ openTime: globalOpen, closeTime: globalClose }],
      }))
    );
  };

  const updateNetOC = (
    netId: number,
    ocIndex: number,
    field: "openTime" | "closeTime",
    value: string
  ) => {
    setNets((prev) =>
      prev.map((n) => {
        if (n.netId !== netId) return n;
        const newOC = [...n.openCloseTimes];
        newOC[ocIndex] = { ...newOC[ocIndex]!, [field]: value };
        return { ...n, openCloseTimes: newOC };
      })
    );
  };

  const addOCSlot = (netId: number) => {
    setNets((prev) =>
      prev.map((n) => {
        if (n.netId !== netId) return n;
        return {
          ...n,
          openCloseTimes: [
            ...n.openCloseTimes,
            { openTime: "", closeTime: "" },
          ],
        };
      })
    );
  };

  const removeOCSlot = (netId: number, ocIndex: number) => {
    setNets((prev) =>
      prev.map((n) => {
        if (n.netId !== netId) return n;
        return {
          ...n,
          openCloseTimes: n.openCloseTimes.filter((_, i) => i !== ocIndex),
        };
      })
    );
  };

  const applyGlobalTimes = () => {
    if (!globalOpen || !globalClose) return;
    setNets((prev) =>
      prev.map((n) => ({
        ...n,
        openCloseTimes: n.openCloseTimes.map((oc) => ({
          openTime: oc.openTime || globalOpen,
          closeTime: oc.closeTime || globalClose,
        })),
      }))
    );
  };

  // ── Variable helpers ──

  const getVariableValue = (
    effortVariableId: number,
    effortTimeId: number
  ): EffortVariableEntry | undefined => {
    return variableEntries.find(
      (v) =>
        v.effortVariableId === effortVariableId &&
        v.effortTimeId === effortTimeId
    );
  };

  const setVariableValue = (entry: EffortVariableEntry) => {
    setVariableEntries((prev) => {
      const idx = prev.findIndex(
        (v) =>
          v.effortVariableId === entry.effortVariableId &&
          v.effortTimeId === entry.effortTimeId
      );
      if (idx === -1) return [...prev, entry];
      const newEntries = [...prev];
      newEntries[idx] = entry;
      return newEntries;
    });
  };

  // ── Section availability ──

  const basicComplete = !!dateEffort && !!stationId && !!protocolId;

  const netsComplete =
    basicComplete &&
    nets.length > 0 &&
    nets.every((n) =>
      n.openCloseTimes.every((oc) => oc.openTime && oc.closeTime)
    );

  // Variables are always optional, so just need nets done
  const variablesComplete = netsComplete;

  // ── Auto-scroll ──

  const prevUnlocked = useRef({
    nets: false,
    variables: false,
    summary: false,
  });

  useEffect(() => {
    const scroll = (ref: React.RefObject<HTMLDivElement>) => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (basicComplete && !prevUnlocked.current.nets) {
      scroll(sectionRefs.nets);
    } else if (netsComplete && !prevUnlocked.current.variables) {
      scroll(sectionRefs.variables);
    } else if (variablesComplete && !prevUnlocked.current.summary) {
      scroll(sectionRefs.summary);
    }
    prevUnlocked.current = {
      nets: basicComplete,
      variables: netsComplete,
      summary: variablesComplete,
    };
  }, [basicComplete, netsComplete, variablesComplete]);

  // ── Submit ──

  const buildDatetime = (date: string, time: string) => {
    if (!date || !time) return "";
    return `${date}T${time}:00`;
  };

  const handleSubmit = () => {
    if (!stationId || !protocolId || !dateEffort) return;

    const netsPayload = nets.map((n) => ({
      netId: n.netId,
      openCloseTimes: n.openCloseTimes.map((oc) => ({
        openTime: buildDatetime(dateEffort, oc.openTime),
        closeTime: buildDatetime(dateEffort, oc.closeTime),
      })),
    }));

    createEffort.mutate({
      dateEffort: `${dateEffort}T00:00:00`,
      stationId,
      protocolId,
      notes,
      nets: netsPayload,
      effortVariables: variableEntries.filter(
        (v) => v.optionId !== undefined || v.value !== undefined
      ),
      summary: { newBands, recapture, unbanded },
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 pb-32 md:p-6">
      <h1 className="text-2xl font-bold">Novo Esforço</h1>

      {/* ── Section 1: Informações Básicas ── */}
      <Section
        title="Informações Básicas"
        enabled={true}
        sectionRef={sectionRefs.basic}
      >
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Data do Esforço</Label>
            <Input
              type="date"
              value={dateEffort}
              onChange={(e) => setDateEffort(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Estação</Label>
            <Combobox
              options={stationOptions}
              value={stationId ?? undefined}
              onChange={(val) => {
                setStationId(Number(val));
                setNets([]);
              }}
              onClear={() => {
                setStationId(null);
                setNets([]);
              }}
              placeholder="Buscar estação..."
            />
          </div>
          <div>
            <Label>Protocolo</Label>
            <Combobox
              options={protocolOptions}
              value={protocolId ?? undefined}
              onChange={(val) => setProtocolId(Number(val))}
              onClear={() => setProtocolId(null)}
              placeholder="Buscar protocolo..."
            />
          </div>
        </div>
      </Section>

      {/* ── Section 2: Redes ── */}
      <Section
        title="Redes"
        enabled={basicComplete}
        sectionRef={sectionRefs.nets}
      >
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div>
              <Label>Abertura Global</Label>
              <Input
                type="time"
                value={globalOpen}
                onChange={(e) => setGlobalOpen(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Fechamento Global</Label>
              <Input
                type="time"
                value={globalClose}
                onChange={(e) => setGlobalClose(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button variant="outline" onClick={applyGlobalTimes}>
              Aplicar
            </Button>
            <Button variant="outline" onClick={selectAllNets}>
              Selecionar Todas
            </Button>
          </div>

          {stationNets.isLoading && <Loader />}

          <div className="space-y-2">
            <Label>
              Redes ({nets.length} selecionadas de{" "}
              {availableNets.filter((n) => n.netNumber !== "NA").length})
            </Label>
            <div className="space-y-3">
              {availableNets
                .filter((n) => n.netNumber !== "NA")
                .map((net) => {
                  const selected = nets.find(
                    (n) => n.netId === Number(net.netId)
                  );
                  return (
                    <div
                      key={Number(net.netId)}
                      className={`rounded border p-3 ${
                        selected
                          ? "border-blue-500 bg-slate-600"
                          : "border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!selected}
                          onChange={() =>
                            toggleNet(Number(net.netId), net.netNumber)
                          }
                        />
                        <span className="font-medium">
                          Rede {net.netNumber}
                        </span>
                      </div>
                      {selected && (
                        <div className="mt-2 space-y-2 pl-6">
                          {selected.openCloseTimes.map((oc, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2"
                            >
                              <Input
                                type="time"
                                value={oc.openTime}
                                onChange={(e) =>
                                  updateNetOC(
                                    Number(net.netId),
                                    i,
                                    "openTime",
                                    e.target.value
                                  )
                                }
                                className="w-36"
                              />
                              <span>—</span>
                              <Input
                                type="time"
                                value={oc.closeTime}
                                onChange={(e) =>
                                  updateNetOC(
                                    Number(net.netId),
                                    i,
                                    "closeTime",
                                    e.target.value
                                  )
                                }
                                className="w-36"
                              />
                              {selected.openCloseTimes.length > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    removeOCSlot(Number(net.netId), i)
                                  }
                                >
                                  Remover
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOCSlot(Number(net.netId))}
                          >
                            + Horário
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Section 3: Variáveis do Esforço ── */}
      <Section
        title="Variáveis do Esforço"
        enabled={netsComplete}
        sectionRef={sectionRefs.variables}
      >
        {effortVars.isLoading && <Loader />}
        {effortVars.data && (
          <>
            {effortVars.data.variables.length === 0 ? (
              <p className="text-slate-400">
                Nenhuma variável de esforço registrada.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Variável</th>
                      {effortVars.data.timePeriods.map((tp) => (
                        <th
                          key={Number(tp.effortTimeId)}
                          className="text-center"
                        >
                          {tp.portugueseLabel}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {effortVars.data.variables
                      .filter((v) => v.name !== "na_register")
                      .map((variable) => (
                        <tr key={Number(variable.effortVariableId)}>
                          <td className="py-2 pr-4">
                            {variable.portugueseLabel || variable.name}
                            {variable.unit && (
                              <span className="ml-1 text-sm text-slate-400">
                                ({variable.unit})
                              </span>
                            )}
                          </td>
                          {effortVars.data!.timePeriods.map((tp) => {
                            const current = getVariableValue(
                              Number(variable.effortVariableId),
                              Number(tp.effortTimeId)
                            );
                            const isCategorical =
                              variable.type === "categorical" ||
                              variable.type === "val";

                            const catOptions: ComboboxOption[] =
                              variable.options.map((opt) => ({
                                value: Number(opt.effortCategoricalOptionId),
                                label: `${opt.valueOama} - ${opt.description}`,
                                searchText: `${opt.valueOama} ${opt.description}`,
                              }));

                            return (
                              <td
                                key={Number(tp.effortTimeId)}
                                className="px-2 py-2"
                              >
                                {isCategorical ? (
                                  <Combobox
                                    options={catOptions}
                                    value={current?.optionId}
                                    onChange={(val) =>
                                      setVariableValue({
                                        effortVariableId: Number(
                                          variable.effortVariableId
                                        ),
                                        effortTimeId: Number(tp.effortTimeId),
                                        type: "categorical",
                                        optionId: Number(val),
                                      })
                                    }
                                    onClear={() =>
                                      setVariableValue({
                                        effortVariableId: Number(
                                          variable.effortVariableId
                                        ),
                                        effortTimeId: Number(tp.effortTimeId),
                                        type: "categorical",
                                        optionId: undefined,
                                      })
                                    }
                                    placeholder="—"
                                  />
                                ) : (
                                  <Input
                                    className="w-24 text-sm"
                                    value={current?.value ?? ""}
                                    onChange={(e) =>
                                      setVariableValue({
                                        effortVariableId: Number(
                                          variable.effortVariableId
                                        ),
                                        effortTimeId: Number(tp.effortTimeId),
                                        type: "continuous",
                                        value: e.target.value,
                                      })
                                    }
                                  />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Section>

      {/* ── Section 4: Sumário ── */}
      <Section
        title="Sumário"
        enabled={variablesComplete}
        sectionRef={sectionRefs.summary}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Novas Anilhas</Label>
              <Input
                type="number"
                min={0}
                value={newBands}
                onChange={(e) => setNewBands(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Recapturas</Label>
              <Input
                type="number"
                min={0}
                value={recapture}
                onChange={(e) => setRecapture(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Não Anilhadas</Label>
              <Input
                type="number"
                min={0}
                value={unbanded}
                onChange={(e) => setUnbanded(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Notas</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={250}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Review */}
          <div className="rounded border border-slate-500 p-4">
            <h3 className="mb-2 font-semibold">Revisão</h3>
            <p>
              <strong>Data:</strong> {dateEffort}
            </p>
            <p>
              <strong>Estação:</strong>{" "}
              {stations.data?.find((s) => Number(s.stationId) === stationId)
                ?.stationCode ?? "—"}
            </p>
            <p>
              <strong>Protocolo:</strong>{" "}
              {protocols.data?.find(
                (p) => Number(p.protocolId) === protocolId
              )?.protocolCode ?? "—"}
            </p>
            <p>
              <strong>Redes:</strong> {nets.length}
            </p>
            <p>
              <strong>Variáveis preenchidas:</strong>{" "}
              {variableEntries.filter(
                (v) => v.optionId !== undefined || v.value !== undefined
              ).length}
            </p>
          </div>

          {createEffort.error && (
            <p className="text-red-400">
              Erro: {createEffort.error.message}
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={createEffort.isLoading}
            className="w-full"
          >
            {createEffort.isLoading ? "Salvando..." : "Criar Esforço"}
          </Button>
        </div>
      </Section>
    </div>
  );
};

export default NewEffortPage;
