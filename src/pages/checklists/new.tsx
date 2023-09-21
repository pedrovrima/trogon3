import { api } from "@/utils/api";
import * as z from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InputCommand from "@/components/organisms/inputcommand";
import { X } from "lucide-react";

export default function NewChecklists() {
  const { data: sppData, isLoading: sppLoading } =
    api.spp.getSppOptions.useQuery();
  const { data: stationsData, isLoading: stationsLoading } =
    api.stations.getStations.useQuery();
  const { data: detectionTypeData } =
    api.checklist.getChecklistActivities.useQuery();

  const { data: observersData, isLoading: observersLoading } =
    api.banders.getBanders.useQuery();

  const activities = [
    { label: "Anilhamento", value: "AN" },
    { label: "Passarinhada", value: "PA" },
    { label: "Levantamento da Avifauna", value: "LA" },
  ];

  const formSchema = z
    .object({
      stationId: z.string().nonempty("necessario"),
      date: z.string().pipe(z.coerce.date()),
      startTime: z.string(),

      endTime: z.string().nonempty("necessario"),
      notes: z.string(),
      activity: z.string(),
      observers: z.array(
        z.object({
          observerId: z.number(),
        })
      ),
      checklistSpecies: z.array(
        z.object({
          speciesId: z.number(),
          detectionTypeId: z.number(),
        })
      ),
    })
    .required();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stationId: undefined,
      startTime: undefined,
      endTime: undefined,
      notes: "",
      activity: "",
      observers: [{ observerId: 1 }],
      checklistSpecies: [],
    },
  });

  const observerFormArray = useFieldArray({
    name: "observers",
    control: form.control,
  });

  const sppFormArray = useFieldArray({
    name: "checklistSpecies",
    control: form.control,
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };
  return (
    <div className="flex w-full flex-col items-center justify-center">
      {stationsData && observersData && (
        <div className="w-full">
          <h1 className="m-8 text-center text-2xl font-bold">
            Entrar Checklist
          </h1>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex w-full flex-col flex-wrap items-center justify-center gap-8 px-52"
            >
              <div className="w-full">
                <div className="flex  flex-row flex-wrap justify-between">
                  <FormField
                    control={form.control}
                    name="stationId"
                    render={({ field }) => (
                      <FormItem className="basis-1/5">
                        <FormLabel>Estação</FormLabel>
                        <FormControl>
                          <InputCommand
                            className="basis-1/6"
                            options={stationsData.map((station) => ({
                              label: station.code,
                              value: station.id.toString(),
                            }))}
                            {...field}
                          ></InputCommand>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem
                        onFocus={() => console.log("focus")}
                        className="basis-1/6"
                      >
                        <FormLabel>Data</FormLabel>

                        <FormControl>
                          <Input className="" type="date" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem className="basis-1/6">
                        <FormLabel>Hora de Inicio</FormLabel>

                        <FormControl>
                          <Input className="" type="time" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem className="basis-1/6">
                        <FormLabel>Hora de Fim</FormLabel>

                        <FormControl>
                          <Input className="" type="time" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="activity"
                    render={({ field }) => (
                      <FormItem
                        onFocus={() => console.log("2focus")}
                        className="basis-1/6"
                      >
                        <FormLabel>Atividade</FormLabel>
                        <FormControl>
                          <InputCommand
                            className="basis-1/6"
                            options={activities.map((act) => ({
                              label: act.label,
                              value: act.value,
                            }))}
                            {...field}
                          ></InputCommand>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormItem>
                  <FormLabel>Observadores</FormLabel>
                  <div className="flex  w-full flex-row flex-wrap justify-start	gap-6">
                    {observerFormArray.fields.map((_field, index) => (
                      <div
                        key={_field.id}
                        className="flex basis-1/5 flex-row items-center gap-1"
                      >
                        <FormField
                          control={form.control}
                          name={`observers.${index}.observerId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <InputCommand
                                  focusOnRender
                                  className=""
                                  options={observersData.map((observer) => ({
                                    label: observer.code,
                                    value: observer.id.toString(),
                                  }))}
                                  value={field.value?.toString()}
                                  onChange={(e) => field.onChange(+e)}
                                ></InputCommand>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <X
                          onClick={() => observerFormArray.remove(index)}
                          size={18}
                          color="#fc8127"
                          className="cursor-pointer "
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => {
                      observerFormArray.append({ observerId: undefined });
                    }}
                    type="button"
                    variant={"link"}
                    className="pl-0"
                  >
                    Adicionar Observador
                  </Button>
                </FormItem>
                <FormItem>
                  <FormLabel>Avistamentos</FormLabel>
                  <div className="flex  w-full flex-col flex-wrap justify-start	gap-6">
                    {sppFormArray.fields.map((_field, index) => (
                      <div
                        key={_field.id}
                        className="flex basis-1/5 flex-row items-center gap-1"
                      >
                        <FormField
                          control={form.control}
                          name={`checklistSpecies.${index}.speciesId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <InputCommand
                                  focusOnRender
                                  className=""
                                  options={sppData.map((spp) => ({
                                    label: `${spp.code} | ${spp.sciName}`,
                                    value: spp.id.toString(),
                                  }))}
                                  value={field.value}
                                  onChange={(e) => field.onChange(+e)}
                                ></InputCommand>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`checklistSpecies.${index}.detectionTypeId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <InputCommand
                                  onBlur={() => {
                                    console.log(field.value);
                                    if (
                                      field.value &&
                                      sppFormArray.fields.length - 1 === index
                                    )
                                      sppFormArray.append({
                                        sppId: undefined,
                                        detectionTypeId: undefined,
                                      });
                                  }}
                                  className=""
                                  options={detectionTypeData?.map(
                                    (detection) => ({
                                      label: detection.code,
                                      value: detection.id.toString(),
                                    })
                                  )}
                                  value={field.value}
                                  onChange={(e) => field.onChange(+e)}
                                ></InputCommand>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <X
                          onClick={() => sppFormArray.remove(index)}
                          size={18}
                          color="#fc8127"
                          className="cursor-pointer "
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => {
                      sppFormArray.append({
                        sppId: undefined,
                        detectionTypeId: undefined,
                      });
                    }}
                    type="button"
                    variant={"link"}
                    className="pl-0"
                  >
                    Adicionar Avistamento
                  </Button>
                </FormItem>
              </div>
              <Button
                className=" mt-20 w-3/4"
                onClick={() => console.log(form.getValues())}
              >
                Enviar
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
