import { RedisStore } from "connect-redis";
import express from "express";
import session from "express-session";
import { redisClient } from "./config/db.conf";
import { PORT, SESSION_SECRET } from "./config/index.conf";
import passport from "./config/passport.conf";
import router from "./routes/index.route";

const app = express();

app.use(express.json());

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1", router);

app.listen(PORT || 3000, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
