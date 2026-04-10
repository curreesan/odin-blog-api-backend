import express from "express";
import passport from "../middleware/passport.js";
import { signUp, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      message: "Protected route success",
      user: req.user,
    });
  },
);

export default router;
