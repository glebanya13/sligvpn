import { useCallback } from "react";
import { useOsType } from "./useOsType";
import { OsType } from "../helpers/enum";
import { generateVpnConnectUrl } from "../helpers/vpnProtocol";

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

    const activeConfig =
      userInfo.configs.find((config: any) => config.is_active) || null;

    if (!activeConfig) {
      return null;
    }

    if (
      activeConfig.expiry_date &&
      new Date(activeConfig.expiry_date) < new Date()
    ) {
      return null;
    }

    return generateVpnConnectUrl(activeConfig.config_link, osType);
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

      const activeConfig =
        userInfo.configs.find((config: any) => config.is_active) || null;

      if (!activeConfig) {
        return null;
      }

      if (
        activeConfig.expiry_date &&
        new Date(activeConfig.expiry_date) < new Date()
      ) {
        return null;
      }

      return generateVpnConnectUrl(activeConfig.config_link, targetOs);
    },
    [userInfo],
  );

  return {
    getVpnConfigUrl,
    getVpnConfigUrlForOs,
    osType,
    loading,
  };
};
