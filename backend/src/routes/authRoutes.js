const express = require("express");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const router = express.Router();

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

function badCreds(res) {
  return res.status(401).json({
    error: {
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password"
    }
  });
}

router.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: parsed.error.flatten()
      }
    });
  }

  const { email, password } = parsed.data;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@acme.test";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (email.toLowerCase() !== adminEmail.toLowerCase()) return badCreds(res);
  if (password !== adminPassword) return badCreds(res);

  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  const expiresIn = process.env.JWT_EXPIRES_IN || "10m";

  const token = jwt.sign(
    { sub: "admin", role: "Admin", email: adminEmail },
    secret,
    { expiresIn }
  );

  res.json({
    data: {
      token,
      tokenType: "Bearer",
      expiresIn,
      user: { id: "admin", email: adminEmail, role: "Admin", name: "Admin User" }
    }
  });
});

router.post("/logout", (req, res) => {
  // For simplicity we do not store server-side sessions.
  // Logout is implemented by client removing token.
  res.json({ data: { ok: true } });
});

module.exports = router;

