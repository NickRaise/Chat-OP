import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [loggedInUserName, setLoggedInUserName] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const savedUserName = localStorage.getItem("savedUserName");
        const savedUserId = localStorage.getItem("savedUserId");
        if (savedUserId  && savedUserName) {
            setUserId(savedUserId);
            setLoggedInUserName(savedUserName);
        } else {
            axios("/profile")
                .then((response) => {
                    if (response.status == 201) {
                        const { userId, username } = response.data;
                        setUserId(userId);
                        setLoggedInUserName(username);
                        localStorage.setItem("savedUserId", userId);
                        localStorage.setItem("savedUserName", username);
                    }
                })
                .catch((error) => {
                    // Handle error if necessary
                    console.error("Failed to fetch profile:", error);
                });
        }
    }, []);

    const handleLogout = async () => {
        // Clear state and local storage on logout
        console.log('handle logout called');
        setUserId(null);
        setLoggedInUserName(null);
        localStorage.removeItem("savedUserId");
        localStorage.removeItem("savedUserName");
    };

    return (
        <UserContext.Provider
            value={{ loggedInUserName, setLoggedInUserName, userId, setUserId, handleLogout }}
        >
            {children}
        </UserContext.Provider>
    );
}
