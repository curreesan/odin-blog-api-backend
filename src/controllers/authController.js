import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

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

export { signUp };
