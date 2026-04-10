import express from "express";
import passport from "../middleware/passport.js";
import isAuthor from "../middleware/isAuthor.js";
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  updatePostStatus,
} from "../controllers/postController.js";

const router = express.Router();

router.get("/", getAllPosts);
router.get("/:id", getPostById);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAuthor,
  createPost,
);

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isAuthor,
  updatePost,
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  isAuthor,
  deletePost,
);

router.patch(
  "/:id/status",
  passport.authenticate("jwt", { session: false }),
  isAuthor,
  updatePostStatus,
);

export default router;
