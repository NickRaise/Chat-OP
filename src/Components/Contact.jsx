import React from "react";
import Avatar from "./Avatar";

const Contact = ({
    userId,
    selectUserToChat,
    selectedUserID,
    onlineUsers,
    isOnline,
}) => {
    return (
        <div
            className={`px-2 py-1 flex items-center gap-3 cursor-pointer w-full rounded-md hover:bg-purple-200 ${
                selectedUserID === userId &&
                "bg-purple-100 relative left-2 border-l-4 border-purple-500"
            }`}
            onClick={() => selectUserToChat(userId, onlineUsers[userId])}
        >
            <Avatar
                online={isOnline}
                user={onlineUsers[userId]}
                userId={userId}
                isNotOpened={true}
            />
            {onlineUsers[userId]}
        </div>
    );
};

export default Contact;
