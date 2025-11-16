import { storage } from "./storage";

async function seedAdmin() {
  try {
    // Check if any admin users exist
    const existingUsers = await storage.getAdminUsers();
    
    if (existingUsers.length > 0) {
      console.log("Admin users already exist. No seeding needed.");
      console.log(`Existing users: ${existingUsers.map(u => u.username).join(", ")}`);
      process.exit(0);
    }

    // Create the default admin user
    const admin = await storage.createAdminUser({
      username: "admin",
      password: "admin123",
      role: "admin",
    });

    console.log("✓ Default admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("\nIMPORTANT: Please change the password after first login!");
    console.log(`User ID: ${admin.id}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin user:", error);
    process.exit(1);
  }
}

seedAdmin();
