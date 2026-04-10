import express from "express";
import passport from "../middleware/passport.js";
import {
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router({ mergeParams: true });

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  createComment,
);

router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateComment,
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deleteComment,
);

export default router;
