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
      <div className="px-4 py-2">
        <Link href={"/"} className="font-medium">
          Início
        </Link>
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="px-4">
          <AccordionTrigger>Anilhas</AccordionTrigger>
          <AccordionContent>
            <Link href={"/bands/new"}>Adicionar</Link>
          </AccordionContent>
          <AccordionContent>
            <Link href={"/bands"}>Lista</Link>
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
            <Link href={"/banders"}>Lista</Link>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3" className="px-4">
          <AccordionTrigger>Espécies</AccordionTrigger>
          <AccordionContent>
            <Link href={"/species"}>Lista</Link>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4" className="px-4">
          <AccordionTrigger>Estações</AccordionTrigger>
          <AccordionContent>
            <Link href={"/stations/new"}>Adicionar</Link>
          </AccordionContent>
          <AccordionContent>
            <Link href={"/stations"}>Lista</Link>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5" className="px-4">
          <AccordionTrigger>Esforços</AccordionTrigger>
          <AccordionContent>
            <Link href={"/efforts"}>Lista</Link>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-6" className="px-4">
          <AccordionTrigger>Dados</AccordionTrigger>
          <AccordionContent>
            <Link href={"/download"}>Download</Link>
          </AccordionContent>
          <AccordionContent>
            <Link href={"/data-check"}>Verificação</Link>
          </AccordionContent>
          <AccordionContent>
            <Link href={"/datalab"}>DataLab</Link>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
