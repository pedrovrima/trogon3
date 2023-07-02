import { useEffect, useState, type ReactElement } from "react";
import Loader from "./loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  isError: boolean;
  errorMessage: string | undefined;
  isLoading: boolean;
  isSuccess: boolean;
};

export default function ErrorModal({
  isError,
  errorMessage,
  isLoading,
  isSuccess,
}: Props): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsOpen(true);
    }
  }, [isLoading]);

  return (
    <>
      <AlertDialog open={isOpen}>
        <AlertDialogContent className="bg-card">
          {isLoading && <Loader />}
          {isError && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-2xl font-bold text-destructive">
                  Erro!
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center text-destructive-foreground">
                  {errorMessage}{" "}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="w-100 flex sm:justify-center">
                <AlertDialogCancel
                  className="text-seconday-foreground w-36 bg-secondary"
                  onClick={() => setIsOpen(false)}
                >
                  Ok
                </AlertDialogCancel>
              </AlertDialogFooter>
            </>
          )}
          {isSuccess && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-2xl font-bold text-success">
                  Sucesso!
                </AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter className="w-100 flex sm:justify-center">
                <AlertDialogCancel
                  className="text-seconday-foreground w-36 bg-secondary"
                  onClick={() => setIsOpen(false)}
                >
                  Ok
                </AlertDialogCancel>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
