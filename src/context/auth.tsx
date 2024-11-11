import { useReducer, createContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { apiUrl } from "../apiConfig";

interface AuthProviderProps {
    children: React.ReactNode;
}

interface ActionType {
    type: 'LOGIN' | 'LOGOUT';
    payload?: any;
}

type InitialStateType = {
    user: any;
};

const initialState = {
    user: null,
};

const AuthContext = createContext<{
    state: InitialStateType;
    dispatch: React.Dispatch<ActionType>;
}>({
    state: initialState,
    dispatch: () => null,
});

const reducer = (state: InitialStateType, action: ActionType) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                user: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
            };
        default:
            return state;
    }
};

const AuthProvider = ({ children }: AuthProviderProps) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

    const logoutUser = () => {
        dispatch({ type: 'LOGOUT' });
        window.localStorage.removeItem('user');
        navigate('/login');
    };

    const checkTokenExpiration = (token: string) => {
        if (!token) return;

        try {
            const decodedToken: any = jwtDecode(token);
            const currentTime = Date.now();
            const tokenExpiryTime = decodedToken.exp * 1000;

            if (tokenExpiryTime > currentTime) {
                // Set a timeout for auto-logout when the token expires
                setTimeout(logoutUser, tokenExpiryTime - currentTime);
            } else {
                logoutUser(); // Immediately logout if token is expired
            }
        } catch (error) {
            console.error("Error decoding token:", error);
            logoutUser();
        }
    };

    useEffect(() => {
        const storedUser = window.localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            dispatch({ type: 'LOGIN', payload: userData });

            // Run expiration check only if a token exists
            if (userData.token) {
                checkTokenExpiration(userData.token);
            }
        }
    }, []); // Only run this effect once on mount

    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            const res = error.response;
            if (res?.status === 401 && !res.config.__isRetryRequest) {
                return new Promise((resolve, reject) => {
                    axios
                        .get(`${apiUrl}/auth/logout`)
                        .then(() => {
                            console.log('/401 error > logout');
                            logoutUser();
                        })
                        .catch((err) => {
                            console.error('AXIOS INTERCEPTORS ERROR:', err);
                            reject(error);
                        });
                });
            }
            return Promise.reject(error);
        }
    );

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
