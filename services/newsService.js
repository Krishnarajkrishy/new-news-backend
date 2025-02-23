const axios = require("axios");
const nodemailer = require("nodemailer");
const UserModel = require("../models/UserModel");

const BASE_URL = "https://newsapi.org/v2/top-headlines";
const CATEGORIES = ["politics", "sports", "technology", "business"];

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const fetchNewsFromAPI = async (category) => {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        country: "us",
        category,
        apiKey: process.env.NEWS_API_KEY,
      },
    });
    return response.data.articles || [];
  } catch (err) {
    console.error("Error fetching news:", err);
    return [];
  }
};

const sendEmailNotification = async (user, news) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: user.email,
    subject: `Breaking News: ${news.title}`,
    text: news.description || "No description available.",
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to", user.email);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

const sendNewsAlert = async (news) => {
  const users = await UserModel.find({});
  for (const user of users) {
    if (user.preferences.notifications.includes("email")) {
      const filteredNews = news.filter((n) =>
        user.preferences.categories.includes(n.category || "general")
      );
      for (const newsItem of filteredNews) {
        await sendEmailNotification(user, newsItem);
        user.notificationsHistory.push({
          title: newsItem.title,
          category: newsItem.category || "general",
          timeStamp: new Date(),
          status: "sent",
        });
        await user.save();
      }
    }
  }
};

const fetchNewsAndSendEmails = async () => {
  console.log("Fetching News....");
  let allNews = [];
  for (const category of CATEGORIES) {
    const news = await fetchNewsFromAPI(category);
    allNews = [...allNews, ...news];
  }
  await sendNewsAlert(allNews);
};

module.exports = { fetchNewsAndSendEmails };

