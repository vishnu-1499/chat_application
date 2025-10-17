import React, { createContext, useContext, useState } from 'react'

interface ContextProp {
  type: string,
  setType: React.Dispatch<React.SetStateAction<string>>;
}

export const StateContext = createContext<null | ContextProp>(null);

interface Props {
  children?: React.ReactNode
}

export const ContextProvider = ({ children }: Props) => {
  const [type, setType] = useState<string>("")

  return (
    <StateContext.Provider value={{type, setType}}>
      {children}
    </StateContext.Provider>
  );
}

export const useStateContext = (): ContextProp => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('use with contextprovider');
  }
  return context;
};