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

export default function NewChecklists() {
  const { data: sppData, isLoading: sppLoading } =
    api.spp.getSppOptions.useQuery();
  const { data: stationsData, isLoading: stationsLoading } =
    api.stations.getStations.useQuery();
  const checklistDDetectionTypes =
    api.checklist.getChecklistActivities.useQuery();

  const { data: observersData, isLoading: observersLoading } =
    api.banders.getBanders.useQuery();

  const formSchema = z
    .object({
      stationId: z.string().nonempty("necessario"),
      date: z.string().pipe(z.coerce.date()),
      startTime: z.string(),

      endTime: z.string(),
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
      observers: [],
      checklistSpecies: [],
    },
  });

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      name: "observers",
      control: form.control,
    }
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };
  return (
    <>
      {stationsData && observersData && (
        <div>
          <h1>New Checklists</h1>
          <Form {...form}>
            <form className="w-96" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="stationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estação</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-36">
                        <SelectTrigger>
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-72">
                        {stationsData
                          .sort((a, b) => a.code.localeCompare(b.code))
                          .map((station) => (
                            <SelectItem
                              key={station.id}
                              value={`${station.id}`}
                            >
                              {station.code}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>

                    <FormControl>
                      <Input className="w-36" type="date" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Inicio</FormLabel>

                    <FormControl>
                      <Input className="w-36" type="time" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Fim</FormLabel>

                    <FormControl>
                      <Input className="w-36" type="time" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Observadores</FormLabel>

                {fields.map((field, index) => (
                  <Select
                    key={field.id}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="w-36">
                      <SelectTrigger>
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-72 overflow-y-scroll">
                      {observersData
                        .sort((a, b) => a.code.localeCompare(b.code))
                        .map((observer) => (
                          <SelectItem
                            key={observer.code}
                            value={`${observer.id}`}
                          >
                            {observer.code}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ))}
              </FormItem>

              <Button
                onClick={() => {
                  append({ observerId: 1 });
                }}
              >
                add
              </Button>

              <Button onClick={() => console.log(form.getValues())}>
                Enviar
              </Button>
            </form>
          </Form>
        </div>
      )}
    </>
  );
}
