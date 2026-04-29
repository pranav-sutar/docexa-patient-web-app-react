import { createContext, useContext, useState } from "react";

const CacheContext = createContext<any>(null);

export const CacheProvider = ({ children }: any) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [unBookedAllPatients, setUnBookedAllPatients] = useState<any[]>([]);
  return (
    <CacheContext.Provider
      value={{
        appointments,
        setAppointments,
        unBookedAllPatients,
        setUnBookedAllPatients,
      }}
    >
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => useContext(CacheContext);
