import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
    userId: string;
    role: string;
    userEmail: string;
    employeeId?: string;
    iat: number;
    exp: number;
}

/**
 * Reads the employeeId directly from the JWT access token stored in Redux.
 * This is reliable even when redux-persist has stale cached state,
 * because we decode the actual token on every call.
 */
export const useEmployeeId = (): string => {
    const accessToken = useSelector(
        (state: RootState) => state.auth.user?.accessToken
    );

    if (!accessToken) return "";

    try {
        const decoded = jwtDecode<JwtPayload>(accessToken);
        return decoded.employeeId || "";
    } catch {
        return "";
    }
};
