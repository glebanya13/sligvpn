import { OsType } from "./enum";

/**
 * Определяет протокол VPN для конкретной ОС
 * @param osType - тип операционной системы
 * @returns протокол для импорта конфигурации
 */
export const getVpnProtocol = (osType: OsType): string => {
  switch (osType) {
    case OsType.IOS:
    case OsType.ANDROID:
      return "v2raytun://import/";
    case OsType.WINDOWS:
    case OsType.MACOS:
    case OsType.LINUX:
      return "clash://import/";
    default:
      return "v2raytun://import/";
  }
};

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
  const baseUrl = "https://connect.sligvpn.ru/fastconnect";
  const protocol = getVpnProtocol(osType);
  return `${baseUrl}?url=${protocol}${configUrl}`;
};
