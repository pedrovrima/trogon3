import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Textarea,
  Heading,
} from "@chakra-ui/react";

export default function InputField(props) {
  const { form_objects } = props;
  const { register, errors } = form_objects;

  return (
    <>
      <FormControl p={4} isInvalid={errors["notes"]}>
        <FormLabel>
          <Heading size="sm">Comentários</Heading>
        </FormLabel>
        <Textarea {...register("notes", {})}></Textarea>
        <FormErrorMessage>
          {errors["notes"] && errors["notes"].message}
        </FormErrorMessage>{" "}
      </FormControl>
    </>
  );
}
