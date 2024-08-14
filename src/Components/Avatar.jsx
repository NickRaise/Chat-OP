import React from "react";

const Avatar = ({ user, userId, online, isNotOpened }) => {
    const colors = [
        "bg-green-200",
        "bg-teal-200",
        "bg-red-200",
        "bg-yellow-200",
        "bg-blue-200",
        "bg-purple-200",
    ];

    const userIdInBase10 = parseInt(userId, 16);
    const colorIndex = userIdInBase10 % colors.length;
    const bgColor = colors[colorIndex];

    return (
        <div
            className={
                "w-10 h-10 rounded-full flex justify-center items-center relative " +
                bgColor
            }
        >
            {user != undefined && user[0].toUpperCase()}
            {isNotOpened == true && (
                <div
                    className={`absolute w-3 h-3 rounded-full right-0 bottom-1 shadow-sm ${
                        online == true
                            ? "shadow-green-500 bg-green-500"
                            : "shadow-gray-500 bg-gray-500"
                    }`}
                ></div>
            )}
        </div>
    );
};

export default Avatar;
