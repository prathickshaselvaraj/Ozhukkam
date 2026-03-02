import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { prisma } from "./config/prisma.js";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL connected via Prisma");

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();