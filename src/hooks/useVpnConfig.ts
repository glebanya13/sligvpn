import { useCallback } from "react";
import { useOsType } from "./useOsType";
import { OsType } from "../helpers/enum";

export const useVpnConfig = (userInfo?: any, loading?: boolean) => {
  const osType = useOsType();

  const getVpnConfigUrl = useCallback(() => {
    if (loading && !userInfo) {
      return null;
    }
    if (!userInfo) {
      return null;
    }
    if (!userInfo.configs || userInfo.configs.length === 0) {
      return null;
    }

    const latestConfig = userInfo.configs.reduce((latest, current) =>
      current.id > latest.id ? current : latest
    );

    if (
      latestConfig.expiry_date &&
      new Date(latestConfig.expiry_date) < new Date()
    ) {
      return null;
    }

    const baseUrl = "https://connect.sligvpn.ru/fastconnect";
    const configUrl = latestConfig.config_link;

    let protocol: string;

    switch (osType) {
      case OsType.IOS:
      case OsType.ANDROID:
        protocol = "v2raytun://import/";
        break;
      case OsType.WINDOWS:
      case OsType.MACOS:
      case OsType.LINUX:
        protocol = "clash://import/";
        break;
      default:
        protocol = "v2raytun://import/";
    }

    return `${baseUrl}?url=${protocol}${configUrl}`;
  }, [userInfo, osType]);

  const getVpnConfigUrlForOs = useCallback(
    (targetOs: OsType) => {
      if (loading && !userInfo) {
        return null;
      }
      if (!userInfo) {
        return null;
      }
      if (!userInfo.configs || userInfo.configs.length === 0) {
        return null;
      }

      const latestConfig = userInfo.configs.reduce((latest, current) =>
        current.id > latest.id ? current : latest
      );

      if (
        latestConfig.expiry_date &&
        new Date(latestConfig.expiry_date) < new Date()
      ) {
        return null;
      }

      const baseUrl = "https://connect.sligvpn.ru/fastconnect";
      const configUrl = latestConfig.config_link;

      let protocol: string;

      switch (targetOs) {
        case OsType.IOS:
        case OsType.ANDROID:
          protocol = "v2raytun://import/";
          break;
        case OsType.WINDOWS:
        case OsType.MACOS:
        case OsType.LINUX:
          protocol = "clash://import/";
          break;
        default:
          protocol = "v2raytun://import/";
      }

      return `${baseUrl}?url=${protocol}${configUrl}`;
    },
    [userInfo]
  );

  return {
    getVpnConfigUrl,
    getVpnConfigUrlForOs,
    osType,
    loading,
  };
};
