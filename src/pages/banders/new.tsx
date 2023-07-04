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
import QueryModal from "@/components/organisms/query_modal";
import { Textarea } from "@/components/ui/textarea";

export default function NewBands() {
  const mutation = api.banders.createBander.useMutation();

  const formSchema = z.object({
    name: z.string(),
    code: z.string().length(3, { message: "Código deve ter 3 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    phone: z.string(),
    notes: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      console.log(error);
    }
  };

  console.log(mutation);

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <QueryModal
        isLoading={mutation.isLoading}
        isSuccess={mutation.isSuccess}
        errorMessage={mutation.error?.message}
        isError={mutation.isError}
      />
      <h1 className="m-8 text-center text-2xl font-bold">
        Nova Pessoa Anilhadora
      </h1>
      <Form {...form}>
        <form
          className="flex w-72  flex-col gap-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="CJ Ralph" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Codigo</FormLabel>

                <FormControl>
                  <Input placeholder="CJR" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>

                <FormControl>
                  <Input placeholder="cjr@oama.eco.br" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>

                <FormControl>
                  <Input placeholder="+553299999999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas</FormLabel>

                <FormControl>
                  <Textarea placeholder="Nada a declarar" {...field} />
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
