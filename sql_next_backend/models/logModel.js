const mongoose = require("mongoose");
const LogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    displayName: String,
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    givenName: String,
    surname: String,
    details: { type: String, required: true },
    jobTitle: String,
    mail: String,
    officeLocation: String,
    preferredLanguage: String,
    businessPhones: [String],
    mobilePhone: String,
    userPrincipalName: String,
  },
  { collection: "user-logs" }
);

const Log = mongoose.model("Log", LogSchema);

module.exports = Log;
