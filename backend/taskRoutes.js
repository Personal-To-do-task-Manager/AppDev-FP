const express = require("express");
const Task = require("./Task");
const auth = require("./authMiddleware");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const tasks = await Task.find({ userId: req.userId });
  res.json(tasks);
});

router.post("/", auth, async (req, res) => {
  const task = new Task({ ...req.body, userId: req.userId });
  await task.save();
  res.json(task);
});

router.put("/:id", auth, async (req, res) => {
  await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body
  );
  res.json({ message: "Updated" });
});

router.delete("/:id", auth, async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ message: "Deleted" });
});

module.exports = router;
