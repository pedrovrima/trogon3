import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { type FormEvent } from "react";

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

  return (
    <NavigationMenu className="w-full justify-between bg-destructive/10 p-4">
      <div>
        <h1 className="text-xl font-extrabold text-white">Trogon</h1>
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
      <form
        onSubmit={async (e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const bandNumber = (e.target as HTMLTest).elements.bandNumber.value;
          console.log(bandNumber);
          await router.push(`/bands/${bandNumber}`);
          return;
        }}
      >
        <Input
          className="placeholder: w-48 p-2 text-white placeholder:text-white"
          placeholder="Busca Anilha"
          name="bandNumber"
        ></Input>
      </form>
    </NavigationMenu>
  );
}
