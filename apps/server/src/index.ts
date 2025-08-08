import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Response } from "express";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_, res: Response) => {
  res.json({name: "Trackademic"});
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
