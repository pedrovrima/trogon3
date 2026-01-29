import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import QueryModal from "@/components/organisms/query_modal";
import { Plus, Trash2 } from "lucide-react";
import Loader from "@/components/organisms/loader";
import { Textarea } from "@/components/ui/textarea";

const netSchema = z.object({
  netId: z.number().int().optional(),
  netNumber: z.string().min(1, "Número da rede é obrigatório"),
  netLat: z.string().min(1, "Latitude é obrigatória"),
  netLong: z.string().min(1, "Longitude é obrigatória"),
  meshSize: z.string().optional(),
  netLength: z.string().optional(),
});

const formSchema = z.object({
  stationCode: z.string().min(1, "Código é obrigatório").max(6),
  stationName: z.string().min(1, "Nome é obrigatório").max(45),
  city: z.string().min(1, "Cidade é obrigatória").max(45),
  state: z.string().min(1, "Estado é obrigatório").max(45),
  centerLat: z.string().min(1, "Latitude é obrigatória"),
  centerLong: z.string().min(1, "Longitude é obrigatória"),
  nets: z.array(netSchema),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewStation() {
  const router = useRouter();
  const createMutation = api.stations.createStation.useMutation({
    retry: false,
  });
  const updateMutation = api.stations.updateStation.useMutation({
    retry: false,
  });
  const submittingRef = useRef(false);
  const [justification, setJustification] = useState("");
  const utils = api.useContext();

  const stationId = useMemo(() => {
    const rawId = Array.isArray(router.query.stationId)
      ? router.query.stationId[0]
      : router.query.stationId ??
        (Array.isArray(router.query.id) ? router.query.id[0] : router.query.id);

    if (!rawId) {
      return null;
    }

    const parsed = Number(rawId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [router.query.id, router.query.stationId]);

  const isEditing = stationId !== null;

  const stationQuery = api.stations.getStationById.useQuery(
    { stationId: stationId ?? 0 },
    {
      enabled: isEditing,
      retry: 0,
      refetchOnWindowFocus: false,
    }
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stationCode: "",
      stationName: "",
      city: "",
      state: "",
      centerLat: "",
      centerLong: "",
      nets: [],
    },
  });

  const isSubmitting =
    createMutation.isLoading ||
    updateMutation.isLoading ||
    form.formState.isSubmitting;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "nets",
  });

  useEffect(() => {
    if (!stationQuery.data) {
      return;
    }

    const stationData = stationQuery.data;
    form.reset({
      stationCode: stationData.stationCode ?? "",
      stationName: stationData.stationName ?? "",
      city: stationData.city ?? "",
      state: stationData.state ?? "",
      centerLat: String(stationData.centerLat ?? ""),
      centerLong: String(stationData.centerLong ?? ""),
      nets: stationData.nets.map((net) => ({
        netId: net.netId,
        netNumber: net.netNumber ?? "",
        netLat: String(net.netLat ?? ""),
        netLong: String(net.netLong ?? ""),
        meshSize: net.meshSize ? String(net.meshSize) : "",
        netLength: net.netLength ? String(net.netLength) : "",
      })),
    });
  }, [form, stationQuery.data]);

  const onSubmit = async (values: FormValues) => {
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    try {
      if (isEditing && stationId) {
        if (!justification.trim()) {
          submittingRef.current = false;
          return;
        }

        await updateMutation.mutateAsync({
          stationId,
          ...values,
          justification: justification.trim(),
        });

        await utils.stations.getStationById.invalidate({ stationId });
        await utils.stations.getStations.invalidate();
        setJustification("");
      } else {
        await createMutation.mutateAsync(values);
        await utils.stations.getStations.invalidate();
        form.reset();
      }
    } catch (error) {
      console.log(error);
    } finally {
      submittingRef.current = false;
    }
  };

  const addNet = () => {
    append({
      netId: undefined,
      netNumber: String(fields.length + 1),
      netLat: "",
      netLong: "",
      meshSize: "",
      netLength: "",
    });
  };

  if (isEditing && stationQuery.isLoading) {
    return <Loader />;
  }

  if (isEditing && stationQuery.data === null) {
    return (
      <div className="mx-auto w-full max-w-2xl p-4 text-center">
        <h1 className="text-2xl font-bold">Estação não encontrada</h1>
      </div>
    );
  }

  const activeMutation = isEditing ? updateMutation : createMutation;
  const isSubmitDisabled = isSubmitting || (isEditing && !justification.trim());

  return (
    <div className="flex w-full flex-col items-center justify-center p-4">
      <QueryModal
        isLoading={activeMutation.isLoading}
        isSuccess={activeMutation.isSuccess}
        errorMessage={activeMutation.error?.message}
        isError={activeMutation.isError}
      />
      <h1 className="m-8 text-center text-2xl font-bold">
        {isEditing ? "Editar Estação" : "Nova Estação"}
      </h1>
      <Form {...form}>
        <form
          className="flex w-full max-w-2xl flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="stationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="OAMA01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Estação OAMA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Bocaina de Minas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Input placeholder="MG" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="centerLat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude Central</FormLabel>
                  <FormControl>
                    <Input placeholder="-22.123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="centerLong"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude Central</FormLabel>
                  <FormControl>
                    <Input placeholder="-44.654321" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Redes ({fields.length})</h2>
              <Button
                type="button"
                variant="outline"
                onClick={addNet}
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Rede
              </Button>
            </div>
            {isEditing && (
              <p className="text-sm text-muted-foreground">
                Remoção de redes não é permitida. Você pode renomear uma rede ou
                criar uma nova rede com o mesmo nome em outra localidade.
                Ajustes de latitude/longitude são possíveis, mas devem ser
                evitados.
              </p>
            )}

            {fields.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma rede adicionada. Clique em &quot;Adicionar Rede&quot; para começar.
              </p>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">Rede {index + 1}</span>
                      {!isEditing && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                      <FormField
                        control={form.control}
                        name={`nets.${index}.netNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`nets.${index}.netLat`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                              <Input placeholder="-22.123456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`nets.${index}.netLong`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longitude</FormLabel>
                            <FormControl>
                              <Input placeholder="-44.654321" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`nets.${index}.meshSize`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Malha (mm)</FormLabel>
                            <FormControl>
                              <Input placeholder="36" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`nets.${index}.netLength`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comprimento (m)</FormLabel>
                            <FormControl>
                              <Input placeholder="12" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label>Justificativa</Label>
              <Textarea
                placeholder="Explique a atualização realizada"
                value={justification}
                onChange={(event) => setJustification(event.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-sm text-muted-foreground">
                Obrigatório para salvar alterações.
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-center">
            <Button
              className="w-36 bg-primary"
              type="submit"
              disabled={isSubmitDisabled}
            >
              {isEditing ? "Atualizar Estação" : "Criar Estação"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
