import { useContext, useState } from "react";
import axios from "axios";
import Register from "./Components/RegisterAndLogin";
import { UserContext } from "./Context/UserContext";
import Chat from "./Components/Chat";
function App() {
    axios.defaults.baseURL = "http://localhost:3000/api/";
    axios.defaults.withCredentials = true;
    const { setLoggedInUserName, setUserId, loggedInUserName } =
        useContext(UserContext);


    if (loggedInUserName) return <Chat/>;

    return (
        <>
            <Register />
        </>
    );
}

export default App;
