const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const db = require("./db");
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://3.91.251.121",
    credentials: true,
  })
);

app.use(
  session({
    secret: "quotevault-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.send("QuoteVault Backend Running");
});

app.get("/quotes", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      error: "Not logged in",
    });
  }

  db.query(
    "SELECT * FROM quotes WHERE user_id = ? ORDER BY created_at DESC",
    [req.session.userId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: "Failed to load quotes",
        });
      }

      res.json(results);
    }
  );
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      [email, hashedPassword],
      (err) => {
        if (err) {
          console.error("Register error:", err);
          return res.status(500).json({ error: "Registration failed" });
        }

        res.json({ message: "User created" });
      }
    );
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error("Login DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = results[0];

      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;

      res.json({ message: "Login successful" });
    }
  );
});

app.post("/quotes", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      error: "Not logged in",
    });
  }

  const { text, author, tags } = req.body;

  db.query(
    `INSERT INTO quotes
     (user_id, text, author, tags)
     VALUES (?, ?, ?, ?)`,
    [
      req.session.userId,
      text,
      author,
      tags,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: "Failed to save quote",
        });
      }

      res.json({
        message: "Quote saved",
        id: result.insertId,
      });
    }
  );
});

app.delete("/quotes/:id", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in" });
  }

  db.query(
    "DELETE FROM quotes WHERE id = ? AND user_id = ?",
    [req.params.id, req.session.userId],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Delete failed" });
      }

      res.json({ message: "Deleted" });
    }
  );
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: "Logout failed",
      });
    }

    res.json({
      message: "Logged out",
    });
  });
});

app.put("/quotes/:id", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const { text, author, tags } = req.body;

  db.query(
    "UPDATE quotes SET text = ?, author = ?, tags = ? WHERE id = ? AND user_id = ?",
    [text, author, tags, req.params.id, req.session.userId],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Update failed" });
      }

      res.json({ message: "Quote updated" });
    }
  );
});

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      [email, hashedPassword],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            error: "Registration failed",
          });
        }

        res.json({
          message: "User created",
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Server error",
    });
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({
          error: "Database error",
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          error: "Invalid credentials",
        });
      }

      const user = results[0];

      const validPassword = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!validPassword) {
        return res.status(401).json({
          error: "Invalid credentials",
        });
      }

      req.session.userId = user.id;

      res.json({
        message: "Login successful",
      });
    }
  );
});