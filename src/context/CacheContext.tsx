import { createContext, useContext, useState } from "react";

const CacheContext = createContext<any>(null);

export const CacheProvider = ({ children }: any) => {
  const [appointments, setAppointments] = useState<any[]>([]);

  return (
    <CacheContext.Provider
      value={{
        appointments,
        setAppointments,
      }}
    >
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => useContext(CacheContext);
