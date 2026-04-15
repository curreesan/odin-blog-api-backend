import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import passport from "../middleware/passport.js";

const signUp = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "All fields required to sign up" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const existingUserName = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUserName) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      username,
      user_id: newUser.id,
    });
  } catch (err) {
    console.log("Signup error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    try {
      if (err) return next(err);

      if (!user) {
        return res.status(401).json({
          message: info?.message || "Login failed",
        });
      }

      // Create JWT AFTER passport verifies user
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return res.json({
        message: "Login successful",
        token,
        user: {
          user: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  })(req, res, next);
};

export { signUp, login };
