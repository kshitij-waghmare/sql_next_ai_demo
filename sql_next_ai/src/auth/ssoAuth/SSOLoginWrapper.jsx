import React, {useState, useEffect} from 'react';
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { msalConfig } from "./msal";
import { UserProvider } from './msal';
// import Routing from '../Routing';

const msalInstance = new PublicClientApplication(msalConfig);

const SSOLoginWrapper = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await msalInstance.initialize();
      await msalInstance.handleRedirectPromise();

      const accounts = msalInstance.getAllAccounts();
      if (!msalInstance.getActiveAccount() && accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
      }

      msalInstance.enableAccountStorageEvents();

      if (accounts.length === 0) {
        msalInstance.loginRedirect().catch(err => console.error(err));
      }

      msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
          msalInstance.setActiveAccount(event.payload.account);
        }
      });

      setInitialized(true);
    };

    init();
  }, []);

  if (!initialized) return <div>Loading...</div>;
  console.log('>>>>',initialized)
  return (
    <MsalProvider instance={msalInstance}>
      <UserProvider>
        {/* <Routing /> */}
        <p>kshitij</p>
      </UserProvider>
    </MsalProvider>
  );
};

export default SSOLoginWrapper;
