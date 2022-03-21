import { useForm } from "react-hook-form";
import InputField from "../fields/input";
import NotesField from "../fields/notes";
import {Box} from "@chakra-ui/react"
const email_test = /\S+@\S+\.\S+/;

const field_object = [
  {
    name: "name",
    portuguese_label: "Nome completo",
    validation: (val) => val,
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
    validation: (val) => val,
  },
];

export default function BanderForm(props) {
  const { defaultValues } = props;
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: "onBlur", defaultValues });

  function onSubmit(values) {
    alert(JSON.stringify(values, null, 2));
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
        <button type="submit">Submit</button>
      </form>
    </Box>
  );
}
