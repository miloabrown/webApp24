import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

function ProtectedRoute({ children }) {
    const [isAuthorized, setIstAuthorized] = useState(null);

    useEffect(() => {
        auth().catch(() => setIstAuthorized(false))
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIstAuthorized(true);
            }
            else {
                setIstAuthorized(false);
            }

        } catch (error) {
            console.log(error);
            setIstAuthorized(false);
        }

    }

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if(!token) {
            setIstAuthorized(false);
            return;
        }
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
            await refreshToken();
        }
        else {
            setIstAuthorized(true);
        }
    }

    if (isAuthorized === null) {
        return <div>Loading...</div >;
    }
    return isAuthorized ? children : <Navigate to="/login" />;

}

export default ProtectedRoute;