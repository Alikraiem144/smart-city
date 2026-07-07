import bcrypt from "bcryptjs";
import { sequelize } from "../config/database";
import { User } from "../models/User";
import { Report } from "../models/Report";

const defectTypes = ["BUCA", "AVVALLAMENTO"] as const;
const severities = ["LOW", "MEDIUM", "HIGH"] as const;
const statuses = ["PENDING", "VALIDATED", "REJECTED"] as const;

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });

    const hashedPassword = await bcrypt.hash("123456", 10);

    const users: any[] = [];

    const admin = await User.create({
      name: "Kraiem",
      email: "kraiem@test.com",
      password: hashedPassword,
      role: "ADMIN",
      coins: 20,
    });

    users.push(admin);

    for (let i = 1; i <= 20; i++) {
      const user = await User.create({
        name: `User ${i}`,
        email: `user${i}@test.com`,
        password: hashedPassword,
        role: "USER",
        coins: Math.floor(Math.random() * 10) + 1,
      });

      users.push(user);
    }

    const reports = [];

    for (let i = 1; i <= 100; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];

      reports.push({
        userId: randomUser.id,
        latitude: 43.615 + Math.random() * 0.03,
        longitude: 13.51 + Math.random() * 0.03,
        defectType: defectTypes[Math.floor(Math.random() * defectTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        reportDate: new Date(
          2026,
          Math.floor(Math.random() * 6),
          Math.floor(Math.random() * 28) + 1
        ),
      });
    }

    await Report.bulkCreate(reports);

    console.log("Database seeded successfully");
    console.log("Admin: kraiem@test.com / 123456");
    console.log("Users: user1@test.com ... user20@test.com / 123456");
    console.log("Created 21 users and 100 reports");
  } catch (error) {
    console.error("Seed error:", error);
  }
};

seedDatabase();