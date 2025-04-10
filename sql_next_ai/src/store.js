import {configureStore} from "@reduxjs/toolkit";
import fileUploadSlice from "./features/fileUploadSlice";
import championsSlice from "./features/championsSlice.js";
import sqlTestSlice from "./features/sqlTestSlice.js";
import fileProcessSlice from "./features/fileProcessSlice.js";

export const store = configureStore({
    reducer: {
        fileUpload: fileUploadSlice,
        champions: championsSlice,
        sqlTest: sqlTestSlice,
        fileProcess: fileProcessSlice
    }
})