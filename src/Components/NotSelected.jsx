import React from "react";

const NotSelected = () => {
    return (
        <div className="flex flex-col justify-center items-center">
            <lord-icon
                src="https://cdn.lordicon.com/shlffxcb.json"
                trigger="loop"
                delay="2000"
                colors="primary:#121331,secondary:#8930e8"
                style={{ width: "250px", height: "250px" }}
            ></lord-icon>
            <div className="text-center mt-4 text-lg text-gray-700">
                <p>
                    <i>No conversations here yet.</i>
                </p>
                <p>
                    <i className="flex gap-1 items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            color="#000000"
                            fill="none"
                        >
                            <path
                                d="M3.99982 11.9998L19.9998 11.9998"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M8.99963 17C8.99963 17 3.99968 13.3176 3.99966 12C3.99965 10.6824 8.99966 7 8.99966 7"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>{" "}
                        Select a user from the sidebar to start chatting.
                    </i>
                </p>
            </div>
        </div>
    );
};

export default NotSelected;
