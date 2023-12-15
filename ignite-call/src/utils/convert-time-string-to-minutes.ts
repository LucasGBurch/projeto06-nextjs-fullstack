export function convertTimeStringToMinutes(timeString: string) {
  const [hours, minutes] = timeString.split(':').map(Number) // Number construtor direto equivale a map((item) => Number)

  return hours * 60 + minutes
}
