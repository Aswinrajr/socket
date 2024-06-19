const allowedOrigins = [
  "https://www.findmyhomestay.online",
  "http://localhost:5173",
  
];

const io = require("socket.io")(8800, {         
  cors: {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);    
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  console.log("New user connected: ", socket.id);
  console.log("Socket connected now :", socket.connected);

  socket.on("new-user-add", (newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
    }
    console.log("Active users: ", activeUsers);
    io.emit("get-users", activeUsers);
  });

  socket.on("send-message", (data) => {
    console.log("Data:", data);
    const { receiverId } = data;
    console.log("Receiver id:", receiverId);
    const user = activeUsers.find((user) => user.userId === receiverId);
    console.log("Active users:", activeUsers);
    console.log("User found:", user);

    if (user) {
      console.log("Sending message to socket:", user.socketId);
      console.log("Socket connected:", socket.connected);
      io.to(user.socketId).emit("receive-message", data);
    } else {
      console.log("User not found or not connected");
    }
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User disconnected: ", socket.id);
    console.log("Socket connected:", socket.connected);
    console.log("Active users: ", activeUsers);
    io.emit("get-users", activeUsers);
  });
});
