import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// Fuso horário do Brasil
const BRAZIL_TIMEZONE = "America/Sao_Paulo";

/**
 * Converte horário UTC do banco para horário local brasileiro para exibição
 * @param utcTime - Horário em formato HH:mm:ss vindo do banco (UTC)
 * @returns Horário local brasileiro em formato HH:mm:ss
 */
export function utcTimeToLocal(utcTime: string): string {
  if (!utcTime) return "";

  const [hour, minute, second = "0"] = utcTime.split(":");

  const utcDate = dayjs()
    .utc()
    .set("hour", parseInt(hour))
    .set("minute", parseInt(minute))
    .set("second", parseInt(second));

  return utcDate.tz(BRAZIL_TIMEZONE).format("HH:mm:ss");
}

/**
 * Converte horário local brasileiro para UTC para salvar no banco
 * @param localTime - Horário local brasileiro em formato HH:mm:ss
 * @returns Horário UTC em formato HH:mm:ss para salvar no banco
 */
export function localTimeToUtc(localTime: string): string {
  if (!localTime) return "";

  const [hour, minute, second = "0"] = localTime.split(":");

  const localDate = dayjs()
    .tz(BRAZIL_TIMEZONE)
    .set("hour", parseInt(hour))
    .set("minute", parseInt(minute))
    .set("second", parseInt(second));

  return localDate.utc().format("HH:mm:ss");
}
