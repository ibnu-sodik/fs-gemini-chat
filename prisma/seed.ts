// CATATAN: File ini sengaja dikosongkan agar tidak membuat data dummy
// Data user akan dibuat otomatis saat login melalui Logto authentication
//
// UNTUK DEVELOPMENT/TESTING:
// Jika ingin menggunakan data dummy, uncomment kode di bawah ini

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed script running...");
  console.log(
    "ℹ️  No dummy data to seed - using real user data from authentication"
  );
  console.log("✅ Seed completed - database ready for real users");

  /* 
  // ============================================================================
  // DUMMY DATA FOR DEVELOPMENT/TESTING
  // Uncomment kode di bawah ini jika ingin menggunakan data dummy
  // ============================================================================
  
  // Hapus data lama dulu (optional kalau mau clean seed)
  await prisma.message.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.user.deleteMany();

  // Buat 3 user dummy
  const [alice, bob, carol] = await Promise.all([
    prisma.user.create({
      data: {
        email: "alice@example.com",
        logtoId: "logto_alice_123",
        name: "Alice Johnson",
        avatar: "https://i.pravatar.cc/150?u=alice",
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "bob@example.com",
        logtoId: "logto_bob_456",
        name: "Bob Smith",
        avatar: "https://i.pravatar.cc/150?u=bob",
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "carol@example.com",
        logtoId: "logto_carol_789",
        name: "Carol Williams",
        avatar: "https://i.pravatar.cc/150?u=carol",
        isActive: true,
      },
    }),
  ]);

  console.log("✅ Created users:", alice.email, bob.email, carol.email);

  // Alice: 2 sesi
  await prisma.chatSession.create({
    data: {
      title: "Alice First Chat",
      userId: alice.id,
      messages: {
        create: [
          { content: "Halo, ini pesan pertama Alice.", role: "user" },
          { content: "Hai Alice, saya Gemini AI.", role: "assistant" },
        ],
      },
    },
  });

  await prisma.chatSession.create({
    data: {
      title: "Alice Second Chat",
      userId: alice.id,
      messages: {
        create: [
          { content: "Bagaimana cuaca hari ini?", role: "user" },
          { content: "Cuaca cerah dan hangat ☀️", role: "assistant" },
        ],
      },
    },
  });

  // Bob: 1 sesi
  await prisma.chatSession.create({
    data: {
      title: "Bob's Tech Talk",
      userId: bob.id,
      messages: {
        create: [
          { content: "Apa itu Nuxt 3?", role: "user" },
          {
            content: "Nuxt 3 adalah framework full-stack modern berbasis Vue 3.",
            role: "assistant",
          },
        ],
      },
    },
  });

  // Carol: 1 sesi
  await prisma.chatSession.create({
    data: {
      title: "Carol's Recipe Chat",
      userId: carol.id,
      messages: {
        create: [
          { content: "Kasih resep nasi goreng dong.", role: "user" },
          {
            content: "Tentu! Bahan: nasi, bawang putih, kecap, telur, ayam. Masak bawang, tambahkan ayam, telur, lalu nasi dan kecap.",
            role: "assistant",
          },
        ],
      },
    },
  });

  console.log("✅ Created sessions & messages for Alice, Bob, and Carol");
  */
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
