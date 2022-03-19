import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    Input
  } from '@chakra-ui/react'


  

export default function InputField (props){
    const {form_objects,field,mandatory} = props
    const {register,error}=form_objects
    const {name,portuguese_label,duplicable,type,unit,precision,capture_categorical_options}
    return (
        <>
        <FormControl>
       <FormLabel>{`${portuguese_label}${unit?` (${unit})`:""}`}</FormLabel>
        {duplicable? "":<Input {...register(name,{required:true}) }></Input>}
        
        </FormControl>
        </>
    )

}