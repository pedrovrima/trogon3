import InputField from "../components/fields/input";
import { useForm } from "react-hook-form";

const field_object = {
  name: "test",
  portuguese_label: "Teste",
  duplicable: false,
  type: "numeric",
  unit: "perc",
  precision: 1,
  capture_categorical_options: [],
};

export default function Home() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: "onBlur" });


  function onSubmit(values) {
        alert(JSON.stringify(values, null, 2))
    }
  


  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField
          field={field_object}
          form_objects={{ register, errors }}
        ></InputField>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
