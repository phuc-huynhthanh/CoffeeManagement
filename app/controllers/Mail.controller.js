import { transporter } from "../config/mail.config.js";
import fs from "fs";

export const sendMail = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    const file = req.file; // Multer sẽ thêm vào req.file nếu có file upload

    const mailOptions = {
      from: '"Coffee Management" <youremail@gmail.com>',
      to,
      subject,
      text,
      html,
      attachments: [],
    };

    // Nếu có file upload thì thêm vào attachments
    if (file) {
      mailOptions.attachments.push({
        filename: file.originalname,
        path: file.path, // đường dẫn tạm
      });
    }

    await transporter.sendMail(mailOptions);

    // Xóa file sau khi gửi (nếu có)
    if (file) fs.unlinkSync(file.path);

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email", error });
  }
};
