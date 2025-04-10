import React from "react";
import SSOLoginWrapper from "./ssoAuth/SsoLoginWrapper";

const LoginWrapper = ({ children }) => {
  const loginType = import.meta.env.VITE_LOGIN_TYPE;
  console.log('ligin',loginType)
  return loginType === 'SSO' ? <SSOLoginWrapper/>: <></>;
};

export default LoginWrapper;
