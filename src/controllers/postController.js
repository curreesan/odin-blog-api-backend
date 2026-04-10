import prisma from "../lib/prisma.js";

const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({ posts, message: "All published posts" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        comments: {
          include: {
            author: { select: { id: true, username: true } },
          },
        },
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true } },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { _count, ...rest } = post;

    return res.status(200).json({
      ...rest,
      commentsCount: _count.comments,
      message: "Post fetched successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { getAllPosts, getPostById };
