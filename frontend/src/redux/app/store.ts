import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./../slices/adminSlice";
import leadReducer from './../slices/leadSlice';
import documentReducer from './../slices/documentSlice';
import chatReducer from './../slices/chatSlice';
export const store = configureStore({
    reducer: {
        admin: adminReducer,
        lead: leadReducer,
        document: documentReducer,
        chat: chatReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;