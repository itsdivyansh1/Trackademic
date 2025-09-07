import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { prisma } from "../config/db.conf";

// Local strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" }, // use email instead of username
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return done(null, false, { message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: "Invalid password" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user - cache in session to reduce DB calls
passport.deserializeUser(async (id: number, done) => {
  try {
    // Check if user data is already in session
    if (typeof id === "object" && id !== null) {
      return done(null, id); // Already deserialized
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true }, // Don't select password
    });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
