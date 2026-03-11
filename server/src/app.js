import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/", (req, res) => {
  res.send("Ozhukkam API is running");
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;