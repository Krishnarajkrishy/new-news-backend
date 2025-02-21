
const axios = require('axios');
const nodemailer = require('nodemailer');
const UserModel = require('../models/UserModel');

// Email Transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Fetch News from API
const fetchNewsFromAPI = async () => {
    try {
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                apiKey: process.env.NEWS_API_KEY,
                country: 'IN',
                language: 'en',
            },
        });
        return response.data.articles || [];
    } catch (err) {
        console.error('Error fetching news:', err);
        return [];
    }
};

// Send Email Notification
const sendEmailNotification = async (user, news) => {
    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: user.email,
        subject: `Breaking News: ${news.title}`,
        text: news.description || 'No description available.',
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to', user.email);
    } catch (err) {
        console.error('Error sending email:', err);
    }
};

// Send News Alerts to Users
const sendNewsAlert = async (news) => {
    const users = await UserModel.find({});
    for (const user of users) {
        if (user.preferences.notifications.includes('email')) {
            const filteredNews = news.filter(
                (n) => user.preferences.categories.includes(n.category || 'general')
            );
            for (const newsItem of filteredNews) {
                await sendEmailNotification(user, newsItem);
                user.notificationsHistory.push({
                    title: newsItem.title,
                    category: newsItem.category || 'general',
                    timeStamp: new Date(),
                    status: 'sent',
                });
                await user.save();
            }
        }
    }
};

// Fetch News and Send Emails
const fetchNewsAndSendEmails = async () => {
    console.log('Fetching News....');
    const news = await fetchNewsFromAPI();
    await sendNewsAlert(news);
};

module.exports = { fetchNewsAndSendEmails };
