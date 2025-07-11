const express = require("express");
const router = express.Router();
const {
  createGoal,
  getUserGoals,
  getGoals,
  updateGoal,
  getScheduledGoals,
  deleteGoal,
} = require("../controllers/goalController");

// Create a new goal
router.post("/", createGoal);

// Get goals for a user (by param)
router.get("/user/:userId", getUserGoals);

// Get goals for a user (by query param)
router.get("/", getGoals);

// Update a goal
router.put("/:id", updateGoal);

// Delete a goal
router.delete("/:id", deleteGoal);

// Get scheduled goals with status information
router.get("/scheduled", getScheduledGoals);

module.exports = router;
