import admin from "firebase-admin";
import serviceAccount from "../config/baking-bytes-firebase-adminsdk-fbsvc-f1d475102f.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
