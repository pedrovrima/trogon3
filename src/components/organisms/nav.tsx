import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { type FormEvent } from "react";
import SideMenu from "./side_menu";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface HTMLFormControlsCollection2 extends HTMLFormControlsCollection {
  bandNumber: {
    value: string;
  };
}

interface HTMLTest extends HTMLFormElement {
  elements: HTMLFormControlsCollection2;
}
export default function Nav() {
  const router = useRouter();

  const submitFunction = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const bandNumber = (e.target as HTMLTest).elements.bandNumber.value;
    console.log(bandNumber);
    await router.push(`/bands/${bandNumber}`);
    return;
  };
  return (
    <NavigationMenu className="w-full justify-between bg-muted-foreground/20 p-4">
      <div>
        <div className="flex gap-4">
          <SideMenu />
          <h1 className="text-xl font-extrabold text-primary">Trogon</h1>
        </div>
        <NavigationMenuList>
          {/* <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-inherit">
            Item One
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink>Link</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-inherit">
            Item One
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink>Link</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem> */}
        </NavigationMenuList>
      </div>
      <BandForm />
    </NavigationMenu>
  );
}

const BandForm = () => {
  const router = useRouter();

  const formSchema = z.object({
    bandNumber: z.string().min(4, {
      message: "O numero da anilha deve ter no minimo 4 caracteres",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bandNumber: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await router.push(`/bands/${values.bandNumber}`);
    return;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex align-middle"
      >
        <FormField
          control={form.control}
          name="bandNumber"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Numero da Anilha" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant="ghost" type="submit">
          <Search />
        </Button>
      </form>
    </Form>
  );
};
