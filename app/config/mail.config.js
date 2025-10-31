import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail", // hoặc smtp server khác như Outlook, Zoho...
  auth: {
    user: "huynhphucvlm@gmail.com",
    pass: "krbw bded wwtx xmli", // không phải password Gmail, mà là app password
  },
});
