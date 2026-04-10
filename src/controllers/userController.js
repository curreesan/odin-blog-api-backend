import prisma from "../lib/prisma.js";

const becomeAuthor = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "AUTHOR") {
      return res.status(200).json({ message: "You are already an author" });
    }

    const updateUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: "AUTHOR",
      },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    return res
      .status(200)
      .json({ user: updateUser, message: "You are now an author" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { becomeAuthor };
