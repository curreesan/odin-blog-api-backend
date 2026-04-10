import express from "express";
import { becomeAuthor } from "../controllers/userController.js";
import passport from "../middleware/passport.js";

const router = express.Router();

router.post(
  "/become-author",
  passport.authenticate("jwt", { session: false }),
  becomeAuthor,
);

export default router;
