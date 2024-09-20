// firebaseService.js
const admin = require("firebase-admin");

// Inisialisasi Firebase Admin dengan kredensial
const serviceAccount = require("./chatterstream-3acac-firebase-adminsdk-4qxbc-025cbf9735.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (token, message) => {
  const messagePayload = {
    notification: {
      title: "New Message",
      body: message,
    },
    token: token,
  };

  try {
    const response = await admin.messaging().send(messagePayload);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

module.exports = { sendNotification };
