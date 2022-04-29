import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { User } from '../../services/api'
// import storage from 'redux-persist/lib/storage'
import { persistReducer } from "redux-persist";
import storage from 'redux-persist/lib/storage';

type AuthState = {
  user: User | null
  token: string | null
}
// interface authState {
//   user: User;
//   token: string;
// }
// const initialState: authState = {
//   user: null
//   token: null
// }
export const authSlice = createSlice({ 
  name: 'auth',
  initialState: { user: null, token: null } as AuthState,
  reducers: {
    setCredentials: (
      state, 
      { payload: { data }}: PayloadAction<{ data:any }>
    ) => {
      state.user = data.userInfo
      state.token = data.accessToken;
      // state.isLogin = true
      // console.log('user',state.user)
      // console.log('token',state.token)
      // console.log('isLogin',state.isLogin)
    },
  }
})
// export const authReducer = persistReducer({
//   key: 'rtk: auth',
//   storage,
//   whitelist: ['accessToken']
// }, authSlice.reducer)
// }
export const { setCredentials } = authSlice.actions;
export default authSlice.reducer;

