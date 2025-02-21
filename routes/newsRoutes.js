const express = require("express");
const { fetchNewsAndSendEmails } = require("../services/newsService");

const router = express.Router();

router.get("/send-alerts", async (req, res) => {
  try {
    await fetchNewsAndSendEmails();
    return res.status(200).json({ message: "News alerts sent successfully" });
  } catch (err) {
    console.error("Error sending news alerts:", err);
    return res.status(500).json({ error: "Error sending news alerts" });
  }
});

module.exports = router;
