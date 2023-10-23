import { createContext, useState } from 'react';
import { IContext, Component } from '@/types';

export const ProjectContext = createContext();

export const MainPageContext = createContext();

export const MainPageContextProvider = ({children}) => {

  const [mainComponents, setMainComponents] = useState([]);
  const [currentChosenComponent, setCurrentChosenComponent] = useState(null);

  const value = {
    mainComponents,
    setMainComponents,
    currentChosenComponent,
    setCurrentChosenComponent
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