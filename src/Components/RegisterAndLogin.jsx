import React, { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../Context/UserContext";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [retryMessage, setRetryMessage] = useState("");
    const [isRegisterPage, setIsRegisterPage] = useState(true);

    const { setLoggedInUserName, setUserId, loggedInUserName } =
        useContext(UserContext);

    

    async function handleSubmit(e) {
        e.preventDefault();
        if (!username || !password)
            return setRetryMessage("Please enter username and password!");
        try {
            const url = isRegisterPage ? "/register" : "/login";
            const response = await axios.post(url, {
                username,
                password,
            });
            const id = response.data.id;
            setUserId(id);
            setLoggedInUserName(username);
        } catch (err) {
            console.log(err);
            const msg = err.response.data.message;
            setRetryMessage(msg);
        }
    }

    function handleClick(e) {
        e.preventDefault();
        setIsRegisterPage(!isRegisterPage);
        setRetryMessage("");
    }

    return (
        <>
            <div className="bg-violet-200 h-screen flex items-center">
                <form
                    className="p-4 mx-auto w-[400px] translate-y-[-25%]"
                    onSubmit={handleSubmit}
                >
                    <div className="my-2 flex flex-col w-full justify-start gap-1">
                        <label htmlFor="username" className="font-bold text-md">
                            Username:
                        </label>
                        <input
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="rounded-md px-2 py-1 w-full text-md"
                            type="text"
                            name="username"
                        />
                    </div>
                    <div className="my-2 flex flex-col w-full justify-start gap-1">
                        <label htmlFor="password" className="font-bold text-md">
                            Password:
                        </label>
                        <input
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="rounded-md px-2 py-1 w-full text-md"
                            type="password"
                            name="password"
                        />
                    </div>
                    {retryMessage.length !== 0 && (
                        <i className="text-[red]">{retryMessage}</i>
                    )}

                    <button className="my-2 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-md w-full text-md">
                        {isRegisterPage ? "Register" : "Login"}
                    </button>
                    <div>
                        <p>
                            {" "}
                            {isRegisterPage
                                ? "Already a member?"
                                : "Not a member?"}{" "}
                            <button
                                className="mx-1 text-blue-900 hover:underline"
                                onClick={handleClick}
                            >
                                {isRegisterPage ? "Login instead!" : "Register"}
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </>
    );
};

//

export default Register;
