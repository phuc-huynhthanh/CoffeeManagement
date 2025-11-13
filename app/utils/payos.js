import { PayOS } from "@payos/node";
import dotenv from "dotenv";

dotenv.config();

console.log("PayOS Config:", {
  clientId: process.env.PAYOS_CLIENT_ID ? "✓ Có" : "✗ Thiếu",
  apiKey: process.env.PAYOS_API_KEY ? "✓ Có" : "✗ Thiếu", 
  checksumKey: process.env.PAYOS_CHECKSUM_KEY ? "✓ Có" : "✗ Thiếu"
});

// Khởi tạo PayOS instance
const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

console.log("✅ PayOS initialized successfully");

export default payOS;
