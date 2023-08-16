import express from "express";

// create express app
const app = express();

app.get("/", (req, res) => {
  res.send("res from server");
});

export default app;
