const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    preferences: {
      categories: { type: [String], required: true },
      frequency: { type: String, default: "hourly" },
      notifications: { type: [String], required: true },
    },
    oneSignalPlayerId: { type: String },
    notificationsHistory: [
      {
        title: String,
        categories: String,
        timeStamp: Date,
        status: String,
      },
    ],
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
