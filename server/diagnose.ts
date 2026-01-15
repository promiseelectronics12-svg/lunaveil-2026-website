
console.log("[Diagnose] Starting diagnosis...");

try {
    console.log("[Diagnose] Importing express...");
    const express = await import("express");
    console.log("[Diagnose] Express imported.");
    const app = express.default();
    console.log("[Diagnose] Express app created.");

    console.log("[Diagnose] Importing session...");
    const session = await import("express-session");
    const MemoryStore = await import("memorystore");
    const SessionStore = MemoryStore.default(session.default);
    console.log("[Diagnose] Session imported.");

    app.use(session.default({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
        store: new SessionStore({ checkPeriod: 86400000 }),
    }));
    console.log("[Diagnose] Session middleware added.");
    process.env.USE_SQLITE = "true";
    const db = await import("./db.sqlite");
    console.log("[Diagnose] db.sqlite imported.");

    console.log("[Diagnose] Importing auth...");
    const auth = await import("./auth");
    console.log("[Diagnose] auth imported.");
    app.use(auth.default.initialize());
    app.use(auth.default.session());
    console.log("[Diagnose] Passport initialized.");

    console.log("[Diagnose] Importing routes...");
    const routes = await import("./routes");
    console.log("[Diagnose] routes imported.");
    const server = await routes.registerRoutes(app);
    console.log("[Diagnose] Routes registered.");

    console.log("[Diagnose] Importing vite...");
    const vite = await import("./vite");
    console.log("[Diagnose] vite imported.");

    // Only setup vite if we are in dev mode (which we are)
    console.log("[Diagnose] Setting up Vite...");
    await vite.setupVite(app, server);
    console.log("[Diagnose] Vite setup complete.");

} catch (e) {
    console.error("[Diagnose] FAILURE:", e);
}

console.log("[Diagnose] Diagnosis complete.");

export { };
