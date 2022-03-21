export default function create_check(
  capture_categorical_options: [String],
  unit: String
) {
  if (capture_categorical_options?.length) {
    return (value: String) =>
      capture_categorical_options.includes(value) || "Valor não permitido";
  }

  if (unit == "perc") {
    return (value: Number) =>
      (value <= 100 && value >= 0) || "Valor deve ser uma porcentagem";
  }

  return (value) => new Number(value) || "Valor deve ser numérico";
}
