import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Slices/AuthSlice/authSlice";
import formReducer from "./Slices/FormSlice/FormSlice";
import baseApi from "./Api/BaseApi/BaseApi";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import fileReducer from "./Slices/FileSlice/FileSlice";
import chartSliceReducer from "./Slices/ChartSlice/ChartSlice";
import adminApi from "./Api/BaseApi/AdminApi";

const persistConfig = {
  key: "lawalx-auth",
  storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    auth: persistedAuthReducer,
    form: formReducer,
    file: fileReducer,
    chartSlice: chartSliceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware, adminApi.middleware),
});

// Define RootState and AppDispatch types
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
