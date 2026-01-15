import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";


// Conditionally import types based on database type
const USE_SQLITE = process.env.USE_SQLITE === 'true';
console.log(`[Auth] USE_SQLITE: ${USE_SQLITE}`);

import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let schema;
try {
    if (USE_SQLITE) {
        const schemaPath = path.resolve(__dirname, "../shared/schema.sqlite.ts");
        console.log(`[Auth] Importing schema from: ${schemaPath}`);
        schema = await import(pathToFileURL(schemaPath).href);
    } else {
        schema = await import("@shared/schema");
    }
    console.log(`[Auth] Schema imported`);
} catch (e) {
    console.error(`[Auth] Failed to import schema:`, e);
    process.exit(1);
}

const { storage } = USE_SQLITE
    ? await import("./storage.sqlite")
    : await import("./storage");
console.log(`[Auth] Storage imported`);

type AdminUser = typeof schema.adminUsers.$inferSelect;

declare global {
    namespace Express {
        interface User extends Omit<AdminUser, "password"> { }
    }
}

// Normalize Google email to prevent alias-based attacks
function normalizeGoogleEmail(email: string): string {
    const lowercased = email.toLowerCase().trim();

    // For Gmail addresses, remove dots and plus aliases
    if (lowercased.endsWith("@gmail.com") || lowercased.endsWith("@googlemail.com")) {
        const [localPart, domain] = lowercased.split("@");
        // Remove dots from local part and anything after +
        const normalized = localPart.replace(/\./g, "").split("+")[0];
        return `${normalized}@gmail.com`;
    }

    return lowercased;
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

                    // Normalize email to prevent alias-based attacks
                    const normalizedEmail = normalizeGoogleEmail(email);

                    // Only allow login if user with this normalized Google email already exists
                    let user = await storage.getAdminUserByGoogleEmail(normalizedEmail);

                    if (!user) {
                        return done(null, false, { message: "Google account not authorized. Please contact an administrator to link your Google account." } as any);
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
