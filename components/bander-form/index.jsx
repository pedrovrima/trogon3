import { useForm } from "react-hook-form";
import InputField from "../fields/input";
import NotesField from "../fields/notes";
import { Box, Button, Text } from "@chakra-ui/react";
import { useState } from "react";
const email_test = /\S+@\S+\.\S+/;

const field_object = [
  {
    name: "name",
    portuguese_label: "Nome completo",
    validation: (val) => true,
  },
  {
    name: "code",
    portuguese_label: "Código (3 letras)",
    validation: (val) => val.length === 3 || "Precisa ser de 3 letras",
  },
  {
    name: "email",
    portuguese_label: "Email",
    validation: (val) => email_test.test(val) || "Formato incorreto",
  },
  {
    name: "phone",
    portuguese_label: "Telefone",
    validation: (val) => true,
  },
];

export default function BanderForm(props) {
  const [error, setError] = useState();
  const { defaultValues } = props;
  console.log(defaultValues);
  const {
    reset,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur", defaultValues });

  async function onSubmit(values) {
    try {
      const status = await fetch("/api/create_bander", {
        method: "post",
        body: JSON.stringify({
          bander_id: defaultValues?.bander_id,
          data: values,
        }),
      });

      if (status.status == 406) {
        setError("Código já existe para essa organização");
        return
      } else {
        setError("Sucesso");
        reset();
        return
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <Box p={4}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {field_object.map((fl) => (
          <InputField
            id={fl.name}
            field={fl}
            form_objects={{ register, errors }}
          ></InputField>
        ))}
        <NotesField form_objects={{ register, errors }} />
        <Button
          width="100%"
          mt={4}
          colorScheme="teal"
          loadingText="Sending"
          isLoading={isSubmitting}
          type="submit"
        >
          Submit
        </Button>{" "}
        <Text color={error==="Sucesso"?"green":"red"}>{error}</Text>
      </form>
    </Box>
  );
}
