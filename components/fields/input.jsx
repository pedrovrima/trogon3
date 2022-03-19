import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Heading,
} from "@chakra-ui/react";

import create_check from "./create_check";
import create_unit from "./create_units"
export default function InputField(props) {
  const { form_objects, field, mandatory } = props;
  const { register, errors } = form_objects;
  const {
    name,
    portuguese_label,
    duplicable,
    type,
    unit,
    precision,
    capture_categorical_options,
  } = field;
  return (
    <>
      <FormControl p={4} isInvalid={errors[name]}>
        <FormLabel>
          <Heading size="sm">{`${portuguese_label}${unit ? ` (${create_unit(unit)})` : ""}`}</Heading>
        </FormLabel>
        {duplicable ? (
          ""
        ) : (
          <Input
            {...register(name, {
              required: "Campo obrigatório",
              validate: create_check(capture_categorical_options, unit),
            })}
          ></Input>
        )}
        <FormErrorMessage>
          {errors[name] && errors[name].message}
        </FormErrorMessage>{" "}
      </FormControl>
    </>
  );
}
