import express, { Response } from "express";

const app = express();

app.get("/", (_, res: Response) => {
  res.send("Hello from the server");
});

app.listen(8000, () => {
  console.log("Server running ");
});
