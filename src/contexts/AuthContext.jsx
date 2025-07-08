import { createContext, useState, useEffect, useContext } from "react";
import { DataContext } from "./DataContext";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('AppUser')) || null);
    const { login } = useContext(DataContext);

    useEffect(() => {
        if (user) {
            localStorage.setItem('AppUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('AppUser');
        }
    }, [user]);

    const userLogin = (email, password) => {
        const result = login(email, password);
        if (result.success) {
            setUser(result.user);
            return { success: true, user: result.user };
        } else {
            return { success: false, message: result.message };
        }
    };

    const userLogout = () => {
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, userLogin, userLogout }}>
            {children}
        </AuthContext.Provider>
    );
}