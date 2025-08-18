export enum BarberSpecialty {
  BARBEIRO = "Barbeiro",
  COLORISTA = "Colorista",
  MANICURE = "Manicure",
  PEDICURE = "Pedicure",
  SOBRANCELHA = "Designer de Sobrancelha",
  ESTETICA = "Esteticista",
  MASSAGISTA = "Massagista",
  RECEPCIONISTA = "Recepcionista",
  FAXINEIRO = "Faxineiro",
  GERENTE = "Gerente",
  ASSISTENTE = "Assistente",
}

export const barberSpecialties = Object.entries(BarberSpecialty).map(
  ([key, value]) => ({
    value: BarberSpecialty[key as keyof typeof BarberSpecialty],
    label: value,
  }),
);