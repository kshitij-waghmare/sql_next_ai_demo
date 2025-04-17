import React from "react";
import CustomRouter from "./CustomRouter";
import { UserProvider } from "../../context/UserContext";

const CustomLoginWrapper = () => {
  return (
    <>
      <UserProvider>
        <CustomRouter />
      </UserProvider>
    </>
  );
};

export default CustomLoginWrapper;
