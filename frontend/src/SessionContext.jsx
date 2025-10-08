// SessionContext.jsx
import React, { createContext, useState } from 'react';

export const SessionContext = createContext();

const generateUniqueSessionId = () => {
  const array = new Uint32Array(4);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec => dec.toString(36)).join('-');
};

export const SessionProvider = ({ children }) => {
  const [sessionData, setSessionData] = useState(() => (generateUniqueSessionId()));

  return (
    <SessionContext.Provider value={{ sessionData, setSessionData }}>
      {children}
    </SessionContext.Provider>
  );
};
