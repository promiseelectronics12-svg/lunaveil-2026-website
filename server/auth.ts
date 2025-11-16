import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { AdminUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends Omit<AdminUser, "password"> {}
  }
}

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getAdminUserByUsername(username);
      
      if (!user || !user.password) {
        return done(null, false, { message: "Invalid username or password" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        return done(null, false, { message: "Invalid username or password" });
      }

      const { password: _, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error);
    }
  })
);

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
        proxy: true, // Trust proxy headers for correct redirect URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          
          if (!email) {
            return done(new Error("No email found in Google profile"));
          }

          // Check if user with this Google email exists
          let user = await storage.getAdminUserByGoogleEmail(email);
          
          if (!user) {
            // Create new admin user with Google email (createAdminUser already returns user without password)
            const newUser = await storage.createAdminUser({
              username: email.split("@")[0] + "_google",
              password: undefined,
              googleEmail: email,
              role: "admin",
            });
            return done(null, newUser);
          }

          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getAdminUser(id);
    if (!user) {
      return done(null, false);
    }
    const { password: _, ...userWithoutPassword } = user;
    done(null, userWithoutPassword);
  } catch (error) {
    done(error);
  }
});

export default passport;
