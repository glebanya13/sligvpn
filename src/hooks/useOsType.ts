import { useState, useEffect } from "react";
import { OsType } from "../helpers/enum";

export const useOsType = (): OsType => {
  const [osType, setOsType] = useState<OsType>(() => {
    if (typeof window === "undefined") return OsType.WINDOWS;

    const userAgent = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(userAgent)) {
      return OsType.IOS;
    }

    if (/android/.test(userAgent)) {
      return OsType.ANDROID;
    }

    if (/windows/.test(userAgent)) {
      return OsType.WINDOWS;
    }

    if (/macintosh|mac os x/.test(userAgent)) {
      return OsType.MACOS;
    }

    if (/linux/.test(userAgent)) {
      return OsType.LINUX;
    }

    return OsType.WINDOWS;
  });

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;

      const userAgent = navigator.userAgent.toLowerCase();

      if (/iphone|ipad|ipod/.test(userAgent)) {
        setOsType(OsType.IOS);
      } else if (/android/.test(userAgent)) {
        setOsType(OsType.ANDROID);
      } else if (/windows/.test(userAgent)) {
        setOsType(OsType.WINDOWS);
      } else if (/macintosh|mac os x/.test(userAgent)) {
        setOsType(OsType.MACOS);
      } else if (/linux/.test(userAgent)) {
        setOsType(OsType.LINUX);
      } else {
        setOsType(OsType.WINDOWS);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return osType;
};
