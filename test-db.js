import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("Testing database connection...");

    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Test query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Query test successful:", result);

    // Test tables exist
    const sessions = await prisma.chatSession.findMany({ take: 1 });
    console.log(
      "✅ ChatSession table accessible, count sample:",
      sessions.length
    );
  } catch (error) {
    console.error("❌ Database connection failed:", error);

    if (error.code === "P1001") {
      console.log(
        "💡 Suggestion: Check if your IP is whitelisted in Neon dashboard"
      );
    }
    if (error.code === "P2021") {
      console.log("💡 Suggestion: Table does not exist, run prisma migrate");
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
