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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function NewBands() {
  const mutation = api.bands.createBands.useMutation();

  console.log(mutation.error?.message);
  const formSchema = z.object({
    bandSize: z.string().min(1).max(2),
    initialBandNumber: z
      .string()
      .regex(/^[0-9]*$/, { message: "Apenas Números" }),
    finalBandNumber: z
      .string()
      .regex(/^[0-9]*$/, { message: "Apenas Números" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bandSize: "",
      initialBandNumber: "",
      finalBandNumber: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <h1 className="m-8 text-center text-2xl font-bold">
        Adicionar sequencia de anilhas
      </h1>
      <Form {...form}>
        <form
          className="flex w-72  flex-col gap-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="bandSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tamanho da Anilha</FormLabel>
                <FormControl>
                  <Input placeholder="A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="initialBandNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primeira Anilha</FormLabel>

                <FormControl>
                  <Input placeholder="10000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="finalBandNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ultima Anilha</FormLabel>

                <FormControl>
                  <Input placeholder="10050" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-8 flex items-center justify-center">
            <Button className="w-36 bg-primary" type="submit">
              Enviar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
