import { OsType } from "./enum";

/**
 * Генерирует URL для быстрого подключения к VPN
 * @param configUrl - ссылка на конфигурацию
 * @param osType - тип операционной системы
 * @returns полный URL для подключения
 */
export const generateVpnConnectUrl = (
  configUrl: string,
  osType: OsType,
): string => {
  void osType;
  const baseUrl = "https://receiver.sligvpn.ru/happ_redirect";
  return `${baseUrl}?config=${encodeURIComponent(configUrl)}`;
};
