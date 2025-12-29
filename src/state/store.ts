/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore, type Store } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import storage from 'redux-persist/lib/storage';
import combineReducer from './rootReducer';
import { baseApi } from './baseApi';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, combineReducer);

const store: Store = configureStore({
  reducer: persistedReducer,
  middleware: (gdm) =>
    gdm({ serializableCheck: false }).concat(baseApi.middleware as any),
});

export const persistor = persistStore(store);
export default store;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof combineReducer>;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
