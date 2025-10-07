import { useState, useEffect } from "react";
import { DeviceType } from "../helpers/enum";

export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>(() => {
    const userAgent =
      navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/ios|iphone|ipad|ipod/i.test(userAgent)) {
      return DeviceType.IOS;
    }

    if (/android/i.test(userAgent)) {
      return DeviceType.ANDROID;
    }

    return DeviceType.DESKTOP;
  });

  useEffect(() => {
    const handleResize = () => {
      const userAgent =
        navigator.userAgent || navigator.vendor || (window as any).opera;

      if (/ios|iphone|ipad|ipod/i.test(userAgent)) {
        setDeviceType(DeviceType.IOS);
      } else if (/android/i.test(userAgent)) {
        setDeviceType(DeviceType.ANDROID);
      } else {
        setDeviceType(DeviceType.DESKTOP);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return deviceType;
};
