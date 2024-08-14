const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user.js");
const cors = require("cors");
const app = express();
const env = require("dotenv");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { WebSocketServer } = require("ws");
const Message = require("./models/message.js");

const port = 3000;
env.config();

const mongoURL = process.env.MONGO_URL;
const jwtSecret = process.env.JWT_SECRET;
const clientURL = process.env.CLIENT_URL;

app.use(express.json());
app.use(
    cors({
        origin: clientURL,
        credentials: true,
    })
);
app.use(cookieParser());

connectMongo().catch((err) => console.log(err));

async function connectMongo() {
    await mongoose.connect(mongoURL);
    console.log("Connected with mongoDB!");
}

app.get("/api/people", async (req, res) => {
    const users = await User.find({}, { _id: 1, username: 1 });
    res.json(users);
});

app.get("/api/profile", (req, res) => {
    const token = req.cookies?.token;
    if (token) {
        if (token == "") return;
        try {
            jwt.verify(token, jwtSecret, {}, (err, userData) => {
                if (err) throw err;
                res.status(201).json({
                    userId: userData.id,
                    username: userData.username,
                });
                console.log("JWT verification successful.");
            });
        } catch (err) {
            res.status(400);
        }
    } else {
        res.status(401);
    }
});

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);
    const user = await User.findOne({ username: username });
    const isCorrectPassword = bcrypt.compare(password, user.password);
    if (user && isCorrectPassword) {
        jwt.sign(
            { id: user._id, username: user.username },
            jwtSecret,
            {},
            (err, token) => {
                if (err) throw err;
                res.cookie("token", token)
                    .status(201)
                    .json({ message: "success", id: user._id });
            }
        );
        console.log("login successful");
    } else {
        res.status(403).json({ message: "Invalid username or password" });
    }
});

app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({
            success: false,
            message: "Username and password are required!",
        });
    console.log("request reached");
    const user = await User.findOne({ username: username });
    if (user)
        return res
            .status(400)
            .json({ message: "User already exits! Please Login" });
    try {
        console.log("here reached --- hash");
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await new User({
            username: username,
            password: hashPassword,
        });
        newUser.save();
        jwt.sign(
            { id: newUser._id, username: newUser.username },
            jwtSecret,
            {},
            (err, token) => {
                if (err) throw err;
                res.cookie("token", token)
                    .status(201)
                    .json({ message: "success", id: newUser._id });
            }
        );
    } catch (error) {
        if (error) throw error;
        res.status(500).json({ message: "Please try again!" });
    }
});

app.post("/api/logout", (req, res) => {
    res.clearCookie("token"); // This will delete the cookie
    console.log("logging out");
    res.status(200).json({ message: "Logged out successfully" });
});

app.get("/api/messages/:userId", async (req, res) => {
    const { userId } = req.params;
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const userData = jwt.verify(token, jwtSecret);
        const ourUserId = userData.id;

        // Validate the userId parameter to ensure it's a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        console.log("userid-> ", userId, "   ourUserID-> ", ourUserId);
        const messages = await Message.find({
            sender: { $in: [userId, ourUserId] },
            receiver: { $in: [userId, ourUserId] },
        });

        console.log(messages);

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(400).json({
            message: "Invalid token or error fetching messages",
        });
    }
});

const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (connection, req) => {
    function notifyAboutOnlineUsers() {
        const allClients = [...wss.clients];
        allClients.forEach((client) => {
            client.send(
                JSON.stringify({
                    online: allClients.map((conn) => ({
                        username: conn.username,
                        id: conn.id,
                    })),
                })
            );
        });
    }

    connection.isAlive = true;

    connection.timer = setInterval(() => {
        connection.ping();

        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false;
            connection.terminate();
            console.log("dead-connection");
            notifyAboutOnlineUsers();
            clearInterval(connection.timer);
        }, 1000);
    }, 5000);

    connection.on("pong", () => {
        clearTimeout(connection.deathTimer);
    });

    const cookies = req.headers.cookie;
    if (cookies) {
        const tokenString = cookies
            .split(";")
            .filter((ele) => ele.startsWith("token"))[0];

        if (tokenString) {
            const token = tokenString.split("=")[1];
            const userData = jwt.verify(token, jwtSecret);
            const { id, username } = userData;
            connection.id = id;
            connection.username = username;
        }
    }

    notifyAboutOnlineUsers();

    connection.on("message", async (msg) => {
        const messageData = JSON.parse(msg.toString());
        const { receiver, text } = messageData;
        console.log(messageData);
        if (receiver && text) {
            const msgDocs = await Message.create({
                sender: connection.id,
                receiver,
                text,
            });
            [...wss.clients]
                .filter((conn) => conn.id === receiver)
                .forEach((conn) =>
                    conn.send(
                        JSON.stringify({
                            text: text,
                            sender: connection.id,
                            id: msgDocs._id,
                        })
                    )
                );
        }
    });
});
