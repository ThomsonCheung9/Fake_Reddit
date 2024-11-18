// ModelContext.js
import React, { createContext, useState } from 'react';
import Model from './models/model';

export const ModelContext = createContext();

export const ModelProvider = ({ children }) => {
  const [modelInstance, setModelInstance] = useState(new Model());

  return (
    <ModelContext.Provider value={modelInstance.data}>
      {children}
    </ModelContext.Provider>
  );
};