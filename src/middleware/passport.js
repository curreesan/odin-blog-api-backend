import passport from "passport";
import bcrypt from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import prisma from "../lib/prisma.js";

//local
const userFields = {
  usernameField: "email",
  passwordField: "password",
};

const checkUser = async (email, password, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return done(null, false, { message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return done(null, false, { message: "Wrong password" });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

// jwt
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const jwtCheckUser = async (payload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      return done(null, false); //unauthorized, no user found
    }

    return done(null, user); //authorized, user attached to req.user
  } catch (err) {
    return done(err, false); //error
  }
};

const localStrategy = new LocalStrategy(userFields, checkUser);
const jwtStrategy = new JwtStrategy(opts, jwtCheckUser);

passport.use(localStrategy);
passport.use(jwtStrategy);

export default passport;
