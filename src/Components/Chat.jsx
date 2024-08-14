import React, { useEffect, useState, useContext, useRef } from "react";
import Avatar from "./Avatar";
import { UserContext } from "../Context/UserContext";
import axios from "axios";
import Contact from "./Contact";
import NotSelected from "./NotSelected";

const Chat = () => {
    const [wsConnection, setWSConnection] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [offlineUsers, setOfflineUsers] = useState({});
    const [newMessage, setNewMessage] = useState("");
    const [selectedUserID, setSelectedUserID] = useState(null);
    const [selectedUsername, setSelectedUser] = useState(null);
    const { userId, loggedInUserName, handleLogout } = useContext(UserContext);
    const [messages, setMessages] = useState([]);
    const chatContainer = useRef(null);
    useEffect(() => {
        connectToWebSocket();
        // Cleanup function to close WebSocket connection on unmount
        return () => {
            if (wsConnection) {
                wsConnection.close();
            }
        };
    }, []);

    function connectToWebSocket() {
        if (wsConnection) return;
        const ws = new WebSocket("ws://localhost:3000");
        setWSConnection(ws);
        ws.addEventListener("message", handleMessage);
        ws.addEventListener("close", () => {
            setTimeout(() => {
                console.log("Disconnected trying to reconnect");
                connectToWebSocket();
            }, 1000);
        });
        ws.addEventListener("open", () => {
            console.log("WebSocket connected");
            setWSConnection(ws);
        });

        // Cleanup on component unmount
        return () => {
            ws.close();
        };
    }

    useEffect(() => {
        if (chatContainer.current) {
            chatContainer.current.scrollTop =
                chatContainer.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (selectedUserID) {
            axios.get("messages/" + selectedUserID).then((res) => {
                const { data } = res;
                setMessages(data);
            });
        }
        console.log(onlineUserExcludingCurrentUser, onlineUsers);
    }, [selectedUserID]);

    useEffect(() => {
        axios.get("/people").then((res) => {
            const offlinePeopleArr = res.data
                .filter((p) => p._id !== userId)
                .filter((p) => !Object.keys(onlineUsers).includes(p._id));

            // Convert the array to the desired object format
            const offlinePeople = offlinePeopleArr.reduce((acc, p) => {
                acc[p._id] = p.username; // Use p.username as the value
                return acc;
            }, {});
            setOfflineUsers(offlinePeople);
        });
    }, [onlineUsers]);

    function handleMessage(message) {
        const messageData = JSON.parse(message.data);
        if ("online" in messageData) showOnlineUsers(messageData);
        else if ("text" in messageData) {
            console.log("i am recieving msg", messageData);
            console.log("reached here");
            console.log("seneder->", messageData.sender, "mine", userId);
            if (messageData.sender === selectedUserID) {
                setMessages((prevMessages) => {
                    // Check if the message is a duplicate
                    const isDuplicate = prevMessages.some(
                        (msg) => msg.id === messageData.id
                    );

                    // If not a duplicate, add the new message
                    if (!isDuplicate) {
                        return [...prevMessages, messageData];
                    }

                    // If it's a duplicate, return the previous messages
                    return prevMessages;
                });
            }
        }
    }

    function showOnlineUsers(usersObj) {
        const uniqueOnlineUsers = {};
        usersObj.online.forEach((user) => {
            if (user && user.id) uniqueOnlineUsers[user.id] = user.username;
        });
        console.log("online users", usersObj.online);
        setOnlineUsers(uniqueOnlineUsers);
    }

    function handleSendMessage() {
        if (newMessage == "") return;
        wsConnection.send(
            JSON.stringify({
                receiver: selectedUserID,
                text: newMessage,
            })
        );
        setMessages((prev) => [
            ...prev,
            { text: newMessage, sender: userId, receiver: selectedUserID },
        ]);
        setNewMessage("");
    }

    function handlePressEnter(e) {
        if (e.key === "Enter") handleSendMessage();
    }

    function selectUserToChat(userId, username) {
        setSelectedUserID(userId);
        setSelectedUser(username);
    }

    function closeChatWindow() {
        setSelectedUser(null);
        setSelectedUserID(null);
    }

    function logoutUser() {
        console.log("logging out user");
        axios
            .post("/logout")
            .then(() => {
                if (wsConnection) {
                    wsConnection.close(); // Close WebSocket connection
                }
                handleLogout();
                setWSConnection(null);
            })
            .catch((error) => {
                console.error("Logout failed:", error);
            });
    }

    const onlineUserExcludingCurrentUser = { ...onlineUsers };
    delete onlineUserExcludingCurrentUser[userId];

    return (
        <div className="flex h-screen">
            <div className="left flex flex-col w-1/3 bg-purple-50 p-3 relative">
                <div className="logo font-bold text-2xl hover:cursor-pointer flex items-center">
                    <span className="mx-1 text-purple-600 relative top-[2px]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </span>
                    <span className="text-purple-600">&lt;</span>
                    <span>Chat</span>
                    <span className="text-purple-600">OP/&gt;</span>
                </div>
                <div className="py-5 text-xl flex flex-col gap-1">
                    {Object.keys(onlineUserExcludingCurrentUser).map(
                        (userId) => {
                            return (
                                <Contact
                                    key={userId}
                                    userId={userId}
                                    selectUserToChat={selectUserToChat}
                                    onlineUsers={onlineUsers}
                                    isOnline={true}
                                    selectedUserID={selectedUserID}
                                />
                            );
                        }
                    )}
                    {Object.keys(offlineUsers).map((userId) => (
                        <Contact
                            key={userId}
                            userId={userId}
                            selectUserToChat={selectUserToChat}
                            onlineUsers={offlineUsers}
                            isOnline={false}
                            selectedUserID={selectedUserID}
                        />
                    ))}
                </div>
                <div className="text-xl flex flex-col justify-around w-full mt-auto gap-2">
                    <div
                        className="flex justify-center items-center gap-3 cursor-pointer"
                        onClick={closeChatWindow}
                    >
                        <Avatar user={loggedInUserName} userId={userId} />
                        {loggedInUserName}{" "}
                    </div>

                    <div
                        className="logout text-center bg-purple-300 hover:bg-purple-400 py-1 rounded-md cursor-pointer"
                        onClick={logoutUser}
                    >
                        Logout
                    </div>
                </div>
            </div>
            <div className="right bg-purple-100 w-2/3 flex flex-col">
                <div
                    ref={chatContainer}
                    className="messages flex-grow overflow-y-auto h-full"
                >
                    {selectedUserID === null ? (
                        <div className="h-full flex items-center justify-center">
                            <NotSelected />
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <div className="bg-purple-600 flex text-xl items-center gap-2 px-2 pl-8 py-1 mb-3 sticky top-0 z-10 cursor-pointer shadow-md shadow-purple-200">
                                <Avatar
                                    user={selectedUsername}
                                    userId={selectedUserID}
                                />
                                {selectedUsername}
                            </div>
                            {messages.length > 0 &&
                                messages.map((msg, idx) => (
                                    <div
                                        key={msg._id || idx}
                                        className={
                                            "px-5 rounded-lg relative my-[1px] min-h-[26px] max-w-96 break-words  " +
                                            (msg.sender == userId
                                                ? "bg-purple-500 text-white self-end mr-3"
                                                : "bg-gray-600 text-white self-start ml-3")
                                        }
                                    >
                                        {msg.text}
                                        <div
                                            className={`absolute w-0 h-0 border-t-8 border-t-transparent border-r-8 ${
                                                msg.sender == userId
                                                    ? "border-r-purple-500"
                                                    : "border-r-transparent"
                                            } border-b-8 ${
                                                msg.sender == userId
                                                    ? "border-b-purple-500"
                                                    : "border-b-gray-600"
                                            } border-l-8  ${
                                                msg.sender == userId
                                                    ? "border-l-transparent"
                                                    : "border-l-gray-600"
                                            } ${
                                                msg.sender == userId
                                                    ? "bottom-[4px] right-0"
                                                    : "bottom-[4px] left-0"
                                            } -mb-1`}
                                        ></div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
                {selectedUserID !== null && (
                    <div className="sender outline-none m-3 flex justify-center gap-2 min-h-12">
                        <input
                            className="flex-grow px-2 outline-none rounded-lg"
                            type="text"
                            name="message"
                            value={newMessage}
                            placeholder="Type your message here"
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handlePressEnter}
                            id=""
                        />
                        <div
                            className={`p-2 hover:bg-purple-500 rounded-lg cursor-pointer ${
                                newMessage === "" ? "hidden" : ""
                            }`}
                            onClick={handleSendMessage}
                        >
                            <img className="w-8" src="sendIcon.svg" alt="" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
