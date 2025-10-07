import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useUserInfo } from "../hooks/useApi";

interface UserContextType {
  userInfo: any;
  loading: boolean;
  error: string | null;
  fetchUserInfo: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { userInfo, loading, error, fetchUserInfo } = useUserInfo();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      fetchUserInfo();
      setInitialized(true);
    }
  }, [fetchUserInfo, initialized]);

  return (
    <UserContext.Provider value={{ userInfo, loading, error, fetchUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
