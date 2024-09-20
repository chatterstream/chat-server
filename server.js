const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const admin = require("firebase-admin");
const serviceAccount = require("./chatterstream-3acac-firebase-adminsdk-4qxbc-025cbf9735.json");

// Inisialisasi Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Endpoint untuk root URL
app.get('/', (req, res) => {
  res.send('<h1>Server is running!</h1>'); // Mengembalikan pesan sederhana
});

let fcmTokens = []; // Array untuk menyimpan token FCM

// Middleware untuk menangani request JSON
app.use(express.json());

// Endpoint untuk menyimpan token FCM
app.post("/save-token", (req, res) => {
  const { token } = req.body;
  if (token && !fcmTokens.includes(token)) {
    fcmTokens.push(token);
    console.log("Token saved:", token);
  }
  console.log("Current tokens:", fcmTokens); // Log semua token
  res.sendStatus(200);
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("send_message", async (message) => {
    console.log("Received message:", message);
    io.emit("receive_message", message);

    // Kirim notifikasi FCM ke semua token
    for (const receiverToken of fcmTokens) {
      console.log("Sending notification to:", receiverToken); // Log token
      await sendNotification(receiverToken, message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const sendNotification = async (token, message) => {
  const payload = {
    notification: {
      title: "New Message",
      body: message,
    },
  };

  try {
    const response = await admin.messaging().sendToDevice(token, payload);
    console.log("Notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
