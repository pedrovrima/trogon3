import { useState } from "react";
import { Input } from "@/components/ui/input";
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

const netSchema = z.object({
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
  const mutation = api.stations.createStation.useMutation();

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "nets",
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutation.mutateAsync(values);
      form.reset();
    } catch (error) {
      console.log(error);
    }
  };

  const addNet = () => {
    append({
      netNumber: String(fields.length + 1),
      netLat: "",
      netLong: "",
      meshSize: "",
      netLength: "",
    });
  };

  return (
    <div className="flex w-full flex-col items-center justify-center p-4">
      <QueryModal
        isLoading={mutation.isLoading}
        isSuccess={mutation.isSuccess}
        errorMessage={mutation.error?.message}
        isError={mutation.isError}
      />
      <h1 className="m-8 text-center text-2xl font-bold">Nova Estação</h1>
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
              <Button type="button" variant="outline" onClick={addNet}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Rede
              </Button>
            </div>

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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
                            <FormLabel>Malha</FormLabel>
                            <FormControl>
                              <Input placeholder="36mm" {...field} />
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
                            <FormLabel>Comprimento</FormLabel>
                            <FormControl>
                              <Input placeholder="12m" {...field} />
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

          <div className="mt-8 flex items-center justify-center">
            <Button className="w-36 bg-primary" type="submit">
              Criar Estação
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
