const express = require("express");
const contactsRouter = require("./contacts");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Contacts API" });
});

app.use("/contacts", contactsRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
