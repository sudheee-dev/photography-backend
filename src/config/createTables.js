const db = require("./db");

const createTables = () => {
  // USERS TABLE
  const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,

            email VARCHAR(100) UNIQUE NOT NULL,

            password VARCHAR(255) NOT NULL,

            role ENUM('admin', 'user') DEFAULT 'user',

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

  // PROFILES TABLE
  const profilesTable = `
        CREATE TABLE IF NOT EXISTS profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT UNIQUE,

            username VARCHAR(100),

            first_name VARCHAR(100),

            last_name VARCHAR(100),

            dob DATE,

            gender ENUM('male', 'female', 'other'),

            permissions VARCHAR(255),

            profile_image VARCHAR(255),

            bio TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        )
    `;

  const postsTable = `
    CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,

        user_id INT NOT NULL,

        image_url VARCHAR(255),

        description TEXT,

        location VARCHAR(255),

        likes INT DEFAULT 0,

        dislikes INT DEFAULT 0,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    )
`;

  // CREATE USERS TABLE
  db.query(usersTable, (err) => {
    if (err) {
      console.log("Users table error:", err);
    } else {
      console.log("Users table ready ✅");

      // CREATE PROFILES TABLE
      db.query(profilesTable, (err) => {
        if (err) {
          console.log("Profiles table error:", err);
        } else {
          console.log("Profiles table ready ✅");

          db.query(postsTable, (err) => {
            if (err) {
              console.log("Posts table error:", err);
            } else {
              console.log("Posts table ready ✅");
            }
          });
        }
      });
    }
  });
};

module.exports = createTables;
