import { createContext, useState } from 'react';
import { IContext, Component } from '@/types';

export const ProjectContext = createContext();

export const MainPageContext = createContext();

export const MainPageContextProvider = ({children}) => {

  const [mainComponents, setMainComponents] = useState([]);
  const [currentChosenComponent, setCurrentChosenComponent] = useState(null);
  const [currentComponentTree, setCurrentComponentTree] = useState(null);
  const [currentChosenList, setCurrentChosenList] = useState([]);
  const [wasmURL, setWasmUrl] = useState(null);

  const value = {
    mainComponents,
    setMainComponents,
    currentChosenComponent,
    setCurrentChosenComponent,
    currentComponentTree,
    setCurrentComponentTree,
    currentChosenList,
    setCurrentChosenList,
    wasmURL,
    setWasmUrl
  }

  return (
    <MainPageContext.Provider value={{...value}}>
      {children}
    </MainPageContext.Provider>
  )
}

// TODO
export const ComponentsPageContext = createContext("");

// TODO
export const DashboardPageContext = createContext("");