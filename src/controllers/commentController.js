import prisma from "../lib/prisma.js";

const createComment = async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = await prisma.comment.create({
      data: {
        comment: comment.trim(),
        post: {
          connect: { id: postId },
        },
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

    return res.status(201).json({
      comment: newComment,
      message: "Comment created",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const updateComment = async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const postId = Number(req.params.postId);
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        message: "Comment is required",
      });
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment || existingComment.postId !== postId) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (existingComment.authorId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        comment: comment.trim(),
      },
    });

    return res.status(200).json({
      comment: updatedComment,
      message: "Comment updated",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const postId = Number(req.params.postId);

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment || existingComment.postId !== postId) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Get post to check ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isCommentAuthor = existingComment.authorId === req.user.id;
    const isPostAuthor = post.authorId === req.user.id;

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return res.status(200).json({
      message: "Comment deleted",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { createComment, updateComment, deleteComment };
