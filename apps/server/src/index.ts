import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { router } from "./routes/v1";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1", router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
