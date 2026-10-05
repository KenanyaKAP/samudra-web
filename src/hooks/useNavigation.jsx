import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Context to provide navigation-with-fade functionality
const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isFading, setIsFading] = useState(false);

  // Scroll to top when location changes and reset fade
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setIsFading(false);
  }, [location.pathname]);

  const navigateWithFade = (path, { smoothToTop = true } = {}) => {
    if (path === location.pathname) {
      if (smoothToTop) window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsFading(true);

    // wait for animation to finish then navigate
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  return (
    <NavigationContext.Provider value={{ isFading, navigateWithFade }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return ctx;
}

export default useNavigation;
