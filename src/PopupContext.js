import React, { createContext, useState, useContext } from 'react';
import Popup from './components/Popup';

// Create context for managing the global popup state
const PopupContext = createContext();

export const usePopup = () => {
  return useContext(PopupContext);  // Hook to access popup context
};

export const PopupProvider = ({ children }) => {
  const [popupMessage, setPopupMessage] = useState('');
  const [popupEnabled, setPopupEnabled] = useState(false);

  const showGlobalPopup = (message) => {
    setPopupMessage(message);
    setPopupEnabled(true);
  };

  const hideGlobalPopup = () => {
    setPopupEnabled(false);
    setPopupMessage('');
  };

  return (
    <PopupContext.Provider value={{ showGlobalPopup, hideGlobalPopup }}>
      {children}
      <Popup
        message={popupMessage}
        show={popupEnabled}
        onClose={hideGlobalPopup}
      />
    </PopupContext.Provider>
  );
};
