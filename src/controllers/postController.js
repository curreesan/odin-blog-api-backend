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

const createPost = async (req, res) => {
  try {
    const { title, content, status } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const allowedStatus = ["DRAFT", "PUBLISHED"];

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        status: status || "DRAFT",
        author: {
          connect: { id: req.user.id },
        },
      },
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
    });

    return res.status(200).json({ post, message: "Post created successfully" });
  } catch (err) {
    console.error(err);

    if (err.code === "P2002") {
      return res.status(400).json({
        message: "You already have a post with this title",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { title, content, status } = req.body;

    if (!title && !content && !status) {
      return res
        .status(400)
        .json({ message: "Provide at least one field to update" });
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (existingPost.authorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(status && { status }),
      },
    });

    return res.status(200).json({
      post: updatedPost,
      message: "Post updated successfully",
    });
  } catch (err) {
    console.error(err);

    if (err.code === "P2002") {
      return res.status(400).json({
        message: "You already have a post with this title",
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = Number(req.params.id);

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (existingPost.authorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updatePostStatus = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatus = ["DRAFT", "PUBLISHED", "ARCHIVED"];

    if (!status || !allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (existingPost.authorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (existingPost.status === status) {
      return res
        .status(200)
        .json({ post: existingPost, message: `Post is already ${status}` });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { status },
    });

    return res.status(200).json({
      post: updatedPost,
      message: "Post status updated",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAuthorPosts = async (req, res) => {
  try {
    const authorId = Number(req.user.id);

    const posts = await prisma.post.findMany({
      where: { authorId },
      include: {
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      posts,
      message: "All uploaded posts",
    });
  } catch (err) {
    console.error("getAuthorPosts error:", err);
    res.status(500).json({ error: "Failed to fetch author posts" });
  }
};

export {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  updatePostStatus,
  getAuthorPosts,
};
