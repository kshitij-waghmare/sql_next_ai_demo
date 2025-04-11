import React, { useEffect, useState } from "react";

const App = () => {
  const [LoginComponent, setLoginComponent] = useState(null);
  const LOGIN_TYPE = import.meta.env.VITE_LOGIN_TYPE;

  useEffect(() => {
    const loadLoginComponent = async () => {
      try {
        let modulePath = null;

        if (LOGIN_TYPE === "SSO") {
          modulePath = "./auth/ssoAuth/SsoLoginWrapper.jsx";
        } else if (LOGIN_TYPE === "CUSTOM") {
          modulePath = "./auth/customAuth/CustomLoginWrapper.jsx";
        }

        if (modulePath) {
          const { default: Component } = await import(/* @vite-ignore */ modulePath);
          setLoginComponent(() => Component);
        } else {
          console.warn("Unsupported login type:", LOGIN_TYPE);
        }
      } catch (err) {
        console.error("Failed to load login wrapper:", err);
      }
    };
    loadLoginComponent();
  }, [LOGIN_TYPE]);

  return (
     LoginComponent ? <LoginComponent /> : <div>Loading Login...</div>
  );
};

export default App;
