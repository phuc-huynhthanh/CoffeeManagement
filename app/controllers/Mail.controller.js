import { transporter } from "../config/mail.config.js";

export const sendMail = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    const mailOptions = {
      from: '"Coffee Management" <huynhphucvlm@gmail.com>',
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email", error });
  }
};
