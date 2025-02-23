require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const cron = require("node-cron");
const { fetchNewsAndSendEmails } = require("./services/newsService");
const userRoutes = require("./routes/userRoutes");
const newsRoutes = require("./routes/newsRoutes");
const { connectionDb } = require("./DB");

const app = express();


connectionDb();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use("/api/users", userRoutes);
app.use("/api/news", newsRoutes);



cron.schedule("* * * * *", async () => {
  console.log("Fetching News....");
  await fetchNewsAndSendEmails();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
