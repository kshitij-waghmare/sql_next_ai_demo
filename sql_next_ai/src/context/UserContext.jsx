import {useRef, useState} from "react";
import { createContext, useContext } from "react";


const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isLoggedInRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const profileRef = useRef({});
  const [sessionActive, setSessionActive] = useState(false);
  const sessionActiveRef = useRef(false); 

  const [profileFetching, setProfileFetching] = useState(true);
  
  const debounceTimerRef = useRef(null);
  const inActivityTimerRef = useRef(null);

  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        isLoggedInRef,
        profile,
        setProfile,
        profileRef,
        sessionActive,
        setSessionActive,
        sessionActiveRef,
        debounceTimerRef,
        inActivityTimerRef,
        profileFetching,
        setProfileFetching,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
