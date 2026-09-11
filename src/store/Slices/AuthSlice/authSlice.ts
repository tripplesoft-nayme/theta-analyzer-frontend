import { User } from "@/types/Auth/Auth";
import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

interface AuthState {
  user: Partial<User> | null;
}

const initialState: AuthState = {
  user: {
    email: "",
    phone: "",
    userEmail: "",
    userId: "",
    clientId: "",
    role: "",
    specialToken: "",
    accessToken: "",
    refreshToken: "",
    adminAccessToken: "",
    adminRefreshToken: "",
    adminClientId: ''
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const token = action.payload.accessToken
        ? action.payload.accessToken
        : action.payload.specialToken;

      if (action.payload.adminData) {
        const adminToken = action.payload.adminData.accessToken;
        const decode = jwtDecode(adminToken as string) as User;
        state.user = {
          ...state.user,
          adminClientId: decode.clientId
        }
      }

      const decode = jwtDecode(token as string) as User;
      console.log(decode)
      if (action?.payload?.accessToken) {
        state.user = {
          ...state.user,
          userEmail: decode?.userEmail,
          userId: decode?.userId,
          clientId: decode?.clientId,
          employeeId: decode?.employeeId,
          role: decode?.role,
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
          adminAccessToken: action.payload.adminData?.accessToken,
          adminRefreshToken: action.payload.adminData?.refreshToken,
        };
      } else if (action?.payload?.specialToken) {
        state.user = {
          ...state.user,
          email: action.payload.email,
          phone: action.payload.phone,
          userEmail: decode?.userEmail || action.payload.userEmail,
          userId: decode?.userId,
          role: decode?.role,
          specialToken: action.payload.specialToken,
          accessToken: action.payload.specialToken,
          adminAccessToken: action.payload.adminData?.accessToken,
          adminRefreshToken: action.payload.adminData?.refreshToken,
        };
      }
    },
    updateAccessToken: (state, action) => {
      if (state.user && action.payload?.accessToken) {
        state.user.accessToken = action.payload.accessToken;
      }
    },
    logOut: () => {
      localStorage.removeItem("persist:lawalx-auth");
      localStorage.removeItem("persist:root"); // Clean up old collision key
      return initialState;
    },
  },
});

export const { logOut, setUser, updateAccessToken } = authSlice.actions;
export default authSlice.reducer;
