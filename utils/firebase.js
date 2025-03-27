var admin = require("firebase-admin");
var serviceAccount = require("../LockedIn firebase admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
