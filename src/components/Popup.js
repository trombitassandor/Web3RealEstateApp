import { useState, useEffect } from "react";

const Popup = ({ message, show, onClose }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (show) {
      setFadeOut(false);
      const timeout = setTimeout(() => {
        setFadeOut(true);
        setTimeout(onClose, 300); // Close the popup after the fade-out transition ends
      }, 3000); // Wait 3 seconds before starting the fade-out effect
      return () => clearTimeout(timeout);
    }
  }, [show, onClose]);

  return (
    show && <div className={`popup-overlay ${fadeOut ? "fade-out" : ""}`}>
      <div className="popup-content">
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Popup;
