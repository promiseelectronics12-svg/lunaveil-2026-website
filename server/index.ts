console.log("[Index] Starting server...");
import express, { type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
console.log("[Index] Importing routes...");
import { registerRoutes } from "./routes";
console.log("[Index] Importing vite...");
import { setupVite, serveStatic, log } from "./vite";
console.log("[Index] Importing auth...");
import passport from "./auth";
console.log("[Index] Imports complete");

const app = express();
const SessionStore = MemoryStore(session);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'lunaveil-dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());

(async () => {
    try {
        console.log("[Index] Registering routes...");
        const server = await registerRoutes(app);
        console.log("[Index] Routes registered");

        app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
            const status = err.status || err.statusCode || 500;
            const message = err.message || "Internal Server Error";
            res.status(status).json({ message });
            throw err;
        });

        if (app.get("env") === "development") {
            console.log("[Index] Setting up Vite...");
            await setupVite(app, server);
            console.log("[Index] Vite setup complete");
        } else {
            serveStatic(app);
        }

        const port = parseInt(process.env.PORT || '5000', 10);
        server.listen(port, "0.0.0.0", () => {
            log(`serving on port ${port}`);
        });
    } catch (error) {
        console.error("[Index] Server startup failed:", error);
        process.exit(1);
    }
})();
