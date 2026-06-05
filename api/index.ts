import express from 'express';
import session from 'express-session';
import MemoryStore from 'memorystore';
import passport from '../server/auth';
import { registerRoutes } from '../server/routes';

const app = express();
const SessionStore = MemoryStore(session);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'lunaveil-dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
        checkPeriod: 86400000
    }),
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Register API routes
registerRoutes(app);

export default app;
