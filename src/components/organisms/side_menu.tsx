import { MenuSquare } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

export default function SideMenu() {
  return (
    <Sheet>
      <SheetTrigger>
        <MenuSquare />
      </SheetTrigger>

      <SheetContent className=" bg-background p-0 align-middle" side={"left"}>
        <SheetHeader className="p-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <Menu />
      </SheetContent>
    </Sheet>
  );
}

const Menu = () => {
  return (
    <div className="flex h-full flex-col justify-around">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="px-4">
          <AccordionTrigger>Anilhas</AccordionTrigger>
          <AccordionContent>
            <Link href={"/bands/new"}>Adicionar</Link>
          </AccordionContent>
          <AccordionContent>
            <Link href={"/bands/summary"}>Sumário</Link>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" className="px-4">
          <AccordionTrigger>Pessoas Anilhadoras</AccordionTrigger>
          <AccordionContent>
            <Link href={"/banders/new"}>Adicionar</Link>
          </AccordionContent>
          <AccordionContent>
            <Link href={"/banders"}>Sumário</Link>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
