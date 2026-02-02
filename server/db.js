const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "data", "db.json");

// Helper to read DB
const readDb = () => {
  if (!fs.existsSync(dbPath)) {
    // Create default if missing (redundant if we create it, but good safety)
    const initial = {
      admin: {
        email: "mattiaghigo60@gmail.com",
        passwordHash: null,
        isSetup: false,
      },
      stats: { visitors: 0, registeredUsers: 0, orders: 0 },
      messages: [],
      users: [],
      orders: [],
    };
    fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2));
    return initial;
  }
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data);
};

// Helper to write DB
const writeDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

module.exports = { readDb, writeDb };
