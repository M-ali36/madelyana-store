// File: components/_Admin/ProductImageGen/WizardContext.js
// Global wizard state for AI Product Image Generator

"use client";

import { createContext, useContext, useState } from "react";

const WizardContext = createContext(null);

export function WizardProvider({ children }) {
  const [state, setState] = useState({
    bagType: null,
    occasion: null,
    model: null,
    productImage: null,
    dimensions: {
      width: null,
      height: null,
      depth: null
    },
    perspectives: []
  });

  const updateState = (key, value) => {
    setState((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const updateDimensions = (dimensionKey, value) => {
    setState((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimensionKey]: value
      }
    }));
  };

  const togglePerspective = (id) => {
    setState((prev) => {
      const exists = prev.perspectives.includes(id);
      return {
        ...prev,
        perspectives: exists
          ? prev.perspectives.filter((p) => p !== id)
          : [...prev.perspectives, id]
      };
    });
  };

  const resetWizard = () => {
    setState({
      bagType: null,
      occasion: null,
      model: null,
      productImage: null,
      dimensions: { width: null, height: null, depth: null },
      perspectives: []
    });
  };

  return (
    <WizardContext.Provider
      value={{
        state,
        updateState,
        updateDimensions,
        togglePerspective,
        resetWizard
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within WizardProvider");
  }
  return context;
}
