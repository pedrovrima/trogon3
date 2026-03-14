import { type NextPage } from "next";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import Loader from "@/components/organisms/loader";
import { formatDatabaseDate } from "@/lib/utils";
import { Plus, X, Check } from "lucide-react";

type CatValue = {
  captureVariableId: number;
  captureCategoricalOptionId: number;
  instance: number;
};

type ContValue = {
  captureVariableId: number;
  value: string;
  instance: number;
};

type ProtocolVariable = {
  captureVariableId: number;
  name: string | null;
  portugueseLabel: string | null;
  type: string | null;
  unit: string | null;
  duplicable: number;
  options: {
    captureCategoricalOptionId: number;
    valueOama: string;
    description: string;
  }[];
};

// ── Section wrapper ──

function Section({
  title,
  enabled,
  children,
  sectionRef,
  onLeave,
}: {
  title: string;
  enabled: boolean;
  children: React.ReactNode;
  sectionRef?: React.RefObject<HTMLDivElement>;
  onLeave?: () => void;
}) {
  return (
    <div
      ref={sectionRef}
      className={`scroll-mt-4 rounded-md p-6 transition-opacity ${
        enabled ? "bg-slate-700" : "pointer-events-none bg-slate-800 opacity-40"
      }`}
      onBlur={(e) => {
        if (onLeave && !e.currentTarget.contains(e.relatedTarget as Node)) {
          onLeave();
        }
      }}
    >
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

const NewCapturePage: NextPage = () => {
  const router = useRouter();
  const rawEffortId = router.query.effortId;
  const preselectedEffortId =
    rawEffortId && !isNaN(Number(rawEffortId)) ? Number(rawEffortId) : null;

  // Section refs for auto-scroll
  const sectionRefs = {
    effort: useRef<HTMLDivElement>(null!),
    capture: useRef<HTMLDivElement>(null!),
    mandatory: useRef<HTMLDivElement>(null!),
    optional: useRef<HTMLDivElement>(null!),
    finalization: useRef<HTMLDivElement>(null!),
  };

  // Step 1: Base data
  const [stationId, setStationId] = useState<number | null>(null);
  const [effortId, setEffortId] = useState<number | null>(preselectedEffortId);
  const [netEffId, setNetEffId] = useState<number | null>(null);
  const [captureTime, setCaptureTime] = useState("");
  const [banderId, setBanderId] = useState<number | null>(null);
  const [captureCode, setCaptureCode] = useState("");
  const [bandSize, setBandSize] = useState("");
  const [bandId, setBandId] = useState<number | null>(null);
  const [sppId, setSppId] = useState<number | null>(null);

  // Variables
  const [categoricalValues, setCategoricalValues] = useState<CatValue[]>([]);
  const [continuousValues, setContinuousValues] = useState<ContValue[]>([]);

  // Duplicate tracking
  const [duplicateCount, setDuplicateCount] = useState<Record<number, number>>(
    {}
  );

  // Selected optional variables
  const [selectedOptionalIds, setSelectedOptionalIds] = useState<number[]>([]);
  const [optionalModalOpen, setOptionalModalOpen] = useState(false);
  const [optionalSearch, setOptionalSearch] = useState("");

  // Notes
  const [notes, setNotes] = useState("");

  // Queries
  const stations = api.captures.getStations.useQuery();
  const efforts = api.captures.getEffortsByStation.useQuery(
    { stationId: stationId! },
    { enabled: !!stationId }
  );
  const netEfforts = api.captures.getNetEffortsByEffort.useQuery(
    { effortId: effortId! },
    { enabled: !!effortId }
  );
  const banders = api.efforts.getBanders.useQuery();
  const captureCodeOptions = api.captures.getCaptureCodeOptions.useQuery();
  const bandSizes = api.captures.getBandSizes.useQuery();
  const availableBands = api.captures.getAvailableBands.useQuery(
    { bandSize },
    { enabled: !!bandSize }
  );
  const species = api.captures.getSpeciesOptions.useQuery();

  const effortDetail = api.efforts.getEffortById.useQuery(
    { effortId: effortId! },
    { enabled: !!effortId }
  );

  const protocolVariables = api.captures.getProtocolVariables.useQuery(
    { protocolId: Number(effortDetail.data?.protocolId) },
    { enabled: !!effortDetail.data?.protocolId }
  );

  // ── Combobox option lists (memoized) ──

  const stationOptions: ComboboxOption[] = useMemo(
    () =>
      (stations.data ?? []).map((s) => ({
        value: Number(s.stationId),
        label: `${s.stationCode} - ${s.stationName}`,
      })),
    [stations.data]
  );

  const effortOptions: ComboboxOption[] = useMemo(
    () =>
      (efforts.data ?? []).map((e) => ({
        value: Number(e.effortId),
        label: `${formatDatabaseDate(e.dateEffort)} - ${e.protocolCode}`,
      })),
    [efforts.data]
  );

  const netEffortOptions: ComboboxOption[] = useMemo(
    () =>
      (netEfforts.data ?? []).map((ne) => ({
        value: Number(ne.netEffId),
        label: `Rede ${ne.netNumber}`,
      })),
    [netEfforts.data]
  );

  const banderOptions: ComboboxOption[] = useMemo(
    () =>
      (banders.data ?? []).map((b) => ({
        value: Number(b.banderId),
        label: `${b.code} - ${b.name}`,
      })),
    [banders.data]
  );

  const captureCodeOpts: ComboboxOption[] = useMemo(
    () =>
      (captureCodeOptions.data ?? []).map((opt) => ({
        value: opt.value,
        label: `${opt.value} - ${opt.description}`,
      })),
    [captureCodeOptions.data]
  );

  const bandSizeOptions: ComboboxOption[] = useMemo(
    () => (bandSizes.data ?? []).map((s) => ({ value: s, label: s })),
    [bandSizes.data]
  );

  const bandOptions: ComboboxOption[] = useMemo(
    () =>
      (availableBands.data ?? []).map((b) => ({
        value: Number(b.bandId),
        label: String(b.bandNumber),
      })),
    [availableBands.data]
  );

  const speciesOptions: ComboboxOption[] = useMemo(
    () =>
      (species.data ?? []).map((s) => ({
        value: Number(s.sppId),
        label: `${s.sppCode} - ${s.sppName}`,
        searchText: `${s.sppCode} ${s.sppName}`,
      })),
    [species.data]
  );

  const createCapture = api.captures.createCapture.useMutation();

  // ── Variable value helpers (instance-aware) ──

  const getCatValue = useCallback(
    (variableId: number, instance = 0): number | undefined => {
      return categoricalValues.find(
        (v) => v.captureVariableId === variableId && v.instance === instance
      )?.captureCategoricalOptionId;
    },
    [categoricalValues]
  );

  const setCatValue = (
    variableId: number,
    optionId: number,
    instance = 0
  ) => {
    setCategoricalValues((prev) => {
      const idx = prev.findIndex(
        (v) => v.captureVariableId === variableId && v.instance === instance
      );
      const entry = {
        captureVariableId: variableId,
        captureCategoricalOptionId: optionId,
        instance,
      };
      if (idx === -1) return [...prev, entry];
      const newVals = [...prev];
      newVals[idx] = entry;
      return newVals;
    });
  };

  const clearCatValue = (variableId: number, instance = 0) => {
    setCategoricalValues((prev) =>
      prev.filter(
        (v) =>
          !(v.captureVariableId === variableId && v.instance === instance)
      )
    );
  };

  const getContValue = useCallback(
    (variableId: number, instance = 0): string => {
      return (
        continuousValues.find(
          (v) => v.captureVariableId === variableId && v.instance === instance
        )?.value ?? ""
      );
    },
    [continuousValues]
  );

  const setContValue = (variableId: number, value: string, instance = 0) => {
    setContinuousValues((prev) => {
      const idx = prev.findIndex(
        (v) => v.captureVariableId === variableId && v.instance === instance
      );
      const entry = { captureVariableId: variableId, value, instance };
      if (idx === -1) return [...prev, entry];
      const newVals = [...prev];
      newVals[idx] = entry;
      return newVals;
    });
  };

  const getInstanceCount = (variableId: number) =>
    duplicateCount[variableId] ?? 1;

  const addDuplicate = (variableId: number) => {
    setDuplicateCount((prev) => ({
      ...prev,
      [variableId]: (prev[variableId] ?? 1) + 1,
    }));
  };

  const removeDuplicate = (variableId: number, instance: number) => {
    setCategoricalValues((prev) =>
      prev
        .filter(
          (v) =>
            !(v.captureVariableId === variableId && v.instance === instance)
        )
        .map((v) =>
          v.captureVariableId === variableId && v.instance > instance
            ? { ...v, instance: v.instance - 1 }
            : v
        )
    );
    setContinuousValues((prev) =>
      prev
        .filter(
          (v) =>
            !(v.captureVariableId === variableId && v.instance === instance)
        )
        .map((v) =>
          v.captureVariableId === variableId && v.instance > instance
            ? { ...v, instance: v.instance - 1 }
            : v
        )
    );
    setDuplicateCount((prev) => ({
      ...prev,
      [variableId]: Math.max(1, (prev[variableId] ?? 1) - 1),
    }));
  };

  // ── Check if a variable instance is filled ──

  const isVariableFilled = useCallback(
    (variable: ProtocolVariable, instance = 0): boolean => {
      const isCategorical =
        variable.type === "categorical" || variable.type === "val";
      if (isCategorical) {
        const val = getCatValue(variable.captureVariableId, instance);
        return val !== undefined && val > 0;
      }
      const val = getContValue(variable.captureVariableId, instance);
      return val.trim() !== "";
    },
    [getCatValue, getContValue]
  );

  // ── Build combobox options for a categorical variable ──

  const buildVarOptions = useCallback(
    (variable: ProtocolVariable): ComboboxOption[] =>
      variable.options.map((opt) => ({
        value: opt.captureCategoricalOptionId,
        label: `${opt.valueOama} - ${opt.description}`,
        displayValue: opt.valueOama,
        searchText: `${opt.valueOama} ${opt.description}`,
      })),
    []
  );

  // ── Render a single variable input ──

  const renderVariableInput = (
    variable: ProtocolVariable,
    instance = 0,
    showRemove = false
  ) => {
    const isCategorical =
      variable.type === "categorical" || variable.type === "val";
    const label = variable.portugueseLabel || variable.name || "—";

    return (
      <div
        key={`${variable.captureVariableId}-${instance}`}
        className="space-y-1"
      >
        <Label className="flex items-center gap-1">
          {label}
          {instance > 0 && (
            <span className="text-xs text-slate-400">#{instance + 1}</span>
          )}
          {variable.unit && (
            <span className="text-sm text-slate-400">({variable.unit})</span>
          )}
          {showRemove && (
            <button
              type="button"
              className="ml-auto text-red-400 hover:text-red-300"
              onClick={() =>
                removeDuplicate(variable.captureVariableId, instance)
              }
            >
              <X size={14} />
            </button>
          )}
        </Label>
        {isCategorical ? (
          <Combobox
            options={buildVarOptions(variable)}
            value={getCatValue(variable.captureVariableId, instance)}
            onChange={(val) =>
              setCatValue(variable.captureVariableId, Number(val), instance)
            }
            onClear={() => clearCatValue(variable.captureVariableId, instance)}
            placeholder="Buscar..."
          />
        ) : (
          <Input
            value={getContValue(variable.captureVariableId, instance)}
            onChange={(e) =>
              setContValue(variable.captureVariableId, e.target.value, instance)
            }
          />
        )}
      </div>
    );
  };

  // ── Render a variable with all its duplicate instances ──

  const renderVariableWithDuplicates = (variable: ProtocolVariable) => {
    const count = getInstanceCount(variable.captureVariableId);
    const instances = Array.from({ length: count }, (_, i) => i);

    return (
      <div key={variable.captureVariableId} className="space-y-2">
        {instances.map((inst) =>
          renderVariableInput(variable, inst, inst > 0)
        )}
        {variable.duplicable === 1 && (
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            onClick={() => addDuplicate(variable.captureVariableId)}
          >
            <Plus size={12} /> Adicionar{" "}
            {variable.portugueseLabel || variable.name}
          </button>
        )}
      </div>
    );
  };

  // ── Validation / section availability ──

  const effortComplete = !!effortId;

  const captureDataComplete =
    !!effortId &&
    !!netEffId &&
    (captureTime.length === 3 || captureTime === "NA") &&
    !!banderId &&
    !!captureCode &&
    !!bandId &&
    !!sppId;

  const allMandatoryFilled = useMemo(() => {
    const vars = protocolVariables.data?.mandatory ?? [];
    if (vars.length === 0) return true;
    return vars.every((v) => {
      const count = getInstanceCount(v.captureVariableId);
      for (let i = 0; i < count; i++) {
        if (!isVariableFilled(v, i)) return false;
      }
      return true;
    });
  }, [protocolVariables.data?.mandatory, isVariableFilled, duplicateCount]);

  const mandatoryComplete = captureDataComplete && allMandatoryFilled;

  const allSelectedOptionalFilled = useMemo(() => {
    const vars = protocolVariables.data?.optional ?? [];
    const selected = vars.filter((v) =>
      selectedOptionalIds.includes(v.captureVariableId)
    );
    if (selected.length === 0) return true;
    return selected.every((v) => {
      const count = getInstanceCount(v.captureVariableId);
      for (let i = 0; i < count; i++) {
        if (!isVariableFilled(v, i)) return false;
      }
      return true;
    });
  }, [
    protocolVariables.data?.optional,
    selectedOptionalIds,
    isVariableFilled,
    duplicateCount,
  ]);

  const optionalComplete = mandatoryComplete && allSelectedOptionalFilled;

  const allFinalizationFilled = useMemo(() => {
    const vars = protocolVariables.data?.finalization ?? [];
    if (vars.length === 0) return true;
    return vars.every((v) => isVariableFilled(v));
  }, [protocolVariables.data?.finalization, isVariableFilled]);

  const canSubmit = optionalComplete && allFinalizationFilled;

  // ── Scroll helpers (triggered on section blur) ──

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Submit ──

  const handleSubmit = () => {
    if (!netEffId || !banderId || !bandId || !sppId || !captureCode) return;

    createCapture.mutate(
      {
        captureTime,
        captureCode,
        netEffId,
        banderId,
        bandId,
        sppId,
        notes,
        categoricalValues: categoricalValues
          .filter((v) => v.captureCategoricalOptionId > 0)
          .map(({ captureVariableId, captureCategoricalOptionId }) => ({
            captureVariableId,
            captureCategoricalOptionId,
          })),
        continuousValues: continuousValues
          .filter((v) => v.value !== "")
          .map(({ captureVariableId, value }) => ({
            captureVariableId,
            value,
          })),
      },
      {
        onSuccess: (data) => {
          void router.push(`/captures/${data.captureId}/created`);
        },
      }
    );
  };

  const handleNewCapturesSameEffort = () => {
    setNetEffId(null);
    setCaptureTime("");
    setCaptureCode("");
    setBandSize("");
    setBandId(null);
    setSppId(null);
    setCategoricalValues([]);
    setContinuousValues([]);
    setDuplicateCount({});
    setSelectedOptionalIds([]);
    setNotes("");
    createCapture.reset();
    sectionRefs.capture.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    if (preselectedEffortId && !effortId) {
      setEffortId(preselectedEffortId);
    }
  }, [preselectedEffortId, effortId]);

  // ── Optional variable helpers ──

  const availableOptional = protocolVariables.data?.optional ?? [];

  const toggleOptionalVariable = (varId: number) => {
    setSelectedOptionalIds((prev) =>
      prev.includes(varId)
        ? prev.filter((id) => id !== varId)
        : [...prev, varId]
    );
  };

  const removeOptionalVariable = (varId: number) => {
    setSelectedOptionalIds((prev) => prev.filter((id) => id !== varId));
    setCategoricalValues((prev) =>
      prev.filter((v) => v.captureVariableId !== varId)
    );
    setContinuousValues((prev) =>
      prev.filter((v) => v.captureVariableId !== varId)
    );
    setDuplicateCount((prev) => {
      const next = { ...prev };
      delete next[varId];
      return next;
    });
  };

  const selectedOptionalVars = availableOptional.filter((v) =>
    selectedOptionalIds.includes(v.captureVariableId)
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 pb-32 md:p-6">
      <h1 className="text-2xl font-bold">Nova Captura</h1>

      {/* ── Section 1: Esforço ── */}
      <Section
        title="Esforço"
        enabled={true}
        sectionRef={sectionRefs.effort}
        onLeave={() => effortComplete && scrollTo(sectionRefs.capture)}
      >
        {!preselectedEffortId ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Estação</Label>
              <Combobox
                options={stationOptions}
                value={stationId ?? undefined}
                onChange={(val) => {
                  setStationId(Number(val));
                  setEffortId(null);
                  setNetEffId(null);
                }}
                onClear={() => {
                  setStationId(null);
                  setEffortId(null);
                  setNetEffId(null);
                }}
                placeholder="Buscar estação..."
              />
            </div>
            <div>
              <Label>Esforço</Label>
              <Combobox
                options={effortOptions}
                value={effortId ?? undefined}
                onChange={(val) => {
                  setEffortId(Number(val));
                  setNetEffId(null);
                }}
                onClear={() => {
                  setEffortId(null);
                  setNetEffId(null);
                }}
                placeholder="Buscar esforço..."
                disabled={!stationId}
              />
            </div>
          </div>
        ) : (
          effortDetail.data && (
            <div className="rounded border border-slate-500 p-3">
              <p>
                <strong>Esforço:</strong> {effortDetail.data.effortId} —{" "}
                {effortDetail.data.stationCode} — {effortDetail.data.date}
              </p>
            </div>
          )
        )}
      </Section>

      {/* ── Section 2: Dados da Captura ── */}
      <Section
        title="Dados da Captura"
        enabled={effortComplete}
        sectionRef={sectionRefs.capture}
        onLeave={() => captureDataComplete && scrollTo(sectionRefs.mandatory)}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Rede</Label>
              <Combobox
                options={netEffortOptions}
                value={netEffId ?? undefined}
                onChange={(val) => setNetEffId(Number(val))}
                onClear={() => setNetEffId(null)}
                placeholder="Buscar rede..."
                disabled={!effortId}
              />
            </div>
            <div>
              <Label>Hora da Captura (HHM)</Label>
              <Input
                maxLength={3}
                placeholder="065"
                value={captureTime}
                onChange={(e) => {
                  const v = e.target.value.toUpperCase();
                  if (v === "" || v === "N" || v === "NA") {
                    setCaptureTime(v);
                  } else {
                    setCaptureTime(v.replace(/\D/g, "").slice(0, 3));
                  }
                }}
              />
              <p className="mt-1 text-xs text-slate-400">
                Ex: 065 = 06:50, 123 = 12:30, NA
              </p>
            </div>
            <div>
              <Label>Anilhador</Label>
              <Combobox
                options={banderOptions}
                value={banderId ?? undefined}
                onChange={(val) => setBanderId(Number(val))}
                onClear={() => setBanderId(null)}
                placeholder="Buscar anilhador..."
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Código de Captura</Label>
              <Combobox
                options={captureCodeOpts}
                value={captureCode || undefined}
                onChange={(val) => setCaptureCode(String(val))}
                onClear={() => setCaptureCode("")}
                placeholder="Buscar código..."
              />
            </div>
            <div>
              <Label>Tamanho da Anilha</Label>
              <Combobox
                options={bandSizeOptions}
                value={bandSize || undefined}
                onChange={(val) => {
                  setBandSize(String(val));
                  setBandId(null);
                }}
                onClear={() => {
                  setBandSize("");
                  setBandId(null);
                }}
                placeholder="Buscar tamanho..."
              />
            </div>
            <div>
              <Label>Anilha</Label>
              <Combobox
                options={bandOptions}
                value={bandId ?? undefined}
                onChange={(val) => setBandId(Number(val))}
                onClear={() => setBandId(null)}
                placeholder="Buscar anilha..."
                disabled={!bandSize}
              />
            </div>
          </div>

          <div>
            <Label>Espécie</Label>
            <Combobox
              options={speciesOptions}
              value={sppId ?? undefined}
              onChange={(val) => setSppId(Number(val))}
              onClear={() => setSppId(null)}
              placeholder="Buscar por código ou nome..."
            />
          </div>
        </div>
      </Section>

      {/* ── Section 3: Variáveis Obrigatórias ── */}
      <Section
        title="Variáveis Obrigatórias"
        enabled={captureDataComplete}
        sectionRef={sectionRefs.mandatory}
        onLeave={() => mandatoryComplete && scrollTo(sectionRefs.optional)}
      >
        {!effortDetail.data?.protocolId && (
          <p className="text-slate-400">Aguardando protocolo...</p>
        )}
        {effortDetail.data?.protocolId && protocolVariables.isLoading && <Loader />}
        {protocolVariables.error && (
          <p className="text-red-400">
            Erro ao carregar variáveis: {protocolVariables.error.message}
          </p>
        )}
        {protocolVariables.data?.mandatory.length === 0 && (
          <p className="text-slate-400">
            Nenhuma variável obrigatória para este protocolo.
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          {protocolVariables.data?.mandatory.map((v) =>
            renderVariableWithDuplicates(v)
          )}
        </div>
        {!allMandatoryFilled &&
          (protocolVariables.data?.mandatory.length ?? 0) > 0 && (
            <p className="mt-3 text-sm text-yellow-400">
              Preencha todas as variáveis obrigatórias para continuar.
            </p>
          )}
      </Section>

      {/* ── Section 4: Variáveis Opcionais ── */}
      <Section
        title="Variáveis Opcionais"
        enabled={mandatoryComplete}
        sectionRef={sectionRefs.optional}
        onLeave={() => optionalComplete && scrollTo(sectionRefs.finalization)}
      >
        <div className="space-y-4">
          {availableOptional.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOptionalModalOpen(true)}
              >
                <Plus size={14} className="mr-1" /> Adicionar Variável
              </Button>
            </div>
          )}

          {availableOptional.length === 0 && (
            <p className="text-slate-400">
              Nenhuma variável opcional para este protocolo.
            </p>
          )}

          {selectedOptionalVars.length === 0 && availableOptional.length > 0 && (
            <p className="text-slate-400">
              Nenhuma variável selecionada. Clique em &quot;Adicionar
              Variável&quot; para escolher.
            </p>
          )}

          {selectedOptionalVars.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {selectedOptionalVars.map((v) => (
                <div key={v.captureVariableId} className="relative">
                  <button
                    type="button"
                    className="absolute right-0 top-0 z-10 rounded-full bg-red-600 p-0.5 text-white hover:bg-red-500"
                    onClick={() =>
                      removeOptionalVariable(v.captureVariableId)
                    }
                    title="Remover variável"
                  >
                    <X size={12} />
                  </button>
                  {renderVariableWithDuplicates(v)}
                </div>
              ))}
            </div>
          )}

          {!allSelectedOptionalFilled && selectedOptionalVars.length > 0 && (
            <p className="text-sm text-yellow-400">
              Preencha todas as variáveis selecionadas para continuar.
            </p>
          )}
        </div>
      </Section>

      {/* ── Section 5: Finalização ── */}
      <Section
        title="Finalização"
        enabled={optionalComplete}
        sectionRef={sectionRefs.finalization}
      >
        <div className="space-y-4">
          {protocolVariables.data?.finalization.length === 0 && (
            <p className="text-slate-400">
              Nenhuma variável de finalização para este protocolo.
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            {protocolVariables.data?.finalization.map((v) =>
              renderVariableWithDuplicates(v)
            )}
          </div>

          {!allFinalizationFilled &&
            (protocolVariables.data?.finalization.length ?? 0) > 0 && (
              <p className="text-sm text-yellow-400">
                Preencha todas as variáveis de finalização para criar a
                captura.
              </p>
            )}

          <div>
            <Label>Notas</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1500}
              className="mt-1"
              rows={3}
            />
          </div>

          {createCapture.error && (
            <p className="text-red-400">
              Erro: {createCapture.error.message}
            </p>
          )}

          {createCapture.isSuccess ? (
            <div className="space-y-2 rounded border border-green-500 bg-green-900 p-4">
              <p className="text-green-200">Captura criada com sucesso!</p>
              <div className="flex gap-2">
                <Button onClick={handleNewCapturesSameEffort}>
                  Nova Captura (mesmo esforço)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/efforts/${effortId}`)}
                >
                  Voltar ao Esforço
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createCapture.isLoading || !canSubmit}
              className="w-full"
            >
              {createCapture.isLoading ? "Salvando..." : "Criar Captura"}
            </Button>
          )}
        </div>
      </Section>

      {/* Optional variable selection modal */}
      {optionalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-slate-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Selecionar Variáveis</h2>
              <button
                onClick={() => {
                  setOptionalModalOpen(false);
                  setOptionalSearch("");
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <Input
              placeholder="Buscar variável..."
              value={optionalSearch}
              onChange={(e) => setOptionalSearch(e.target.value)}
              className="mb-3"
              autoFocus
            />
            <div className="space-y-2">
              {[...availableOptional]
                .sort((a, b) =>
                  (a.portugueseLabel || a.name || "").localeCompare(
                    b.portugueseLabel || b.name || "",
                    "pt-BR"
                  )
                )
                .filter((v) => {
                  if (!optionalSearch) return true;
                  const q = optionalSearch.toLowerCase();
                  const label = (v.portugueseLabel || v.name || "").toLowerCase();
                  return label.includes(q);
                })
                .map((v) => {
                  const isSelected = selectedOptionalIds.includes(
                    v.captureVariableId
                  );
                  return (
                    <button
                      key={v.captureVariableId}
                      type="button"
                      className={`flex w-full items-center gap-2 rounded border px-3 py-2 text-left text-sm ${
                        isSelected
                          ? "border-blue-500 bg-blue-900 text-blue-200"
                          : "border-slate-600 bg-slate-700 hover:bg-slate-600"
                      }`}
                      onClick={() => toggleOptionalVariable(v.captureVariableId)}
                    >
                      {isSelected ? (
                        <Check size={14} className="text-blue-400" />
                      ) : (
                        <Plus size={14} className="text-slate-400" />
                      )}
                      <span>
                        {v.portugueseLabel || v.name}
                        {v.unit && (
                          <span className="ml-1 text-slate-400">
                            ({v.unit})
                          </span>
                        )}
                      </span>
                      <span className="ml-auto text-xs text-slate-500">
                        {v.type}
                      </span>
                    </button>
                  );
                })}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => {
                  setOptionalModalOpen(false);
                  setOptionalSearch("");
                }}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewCapturePage;
