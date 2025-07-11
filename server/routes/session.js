const express = require("express");
const {
  createSession,
  getSessionsByGoal,
  updateSession,
  deleteSession,
  getSessions,
} = require("../controllers/sessionController");

const router = express.Router();

router.post("/", createSession);
router.get("/", getSessions);
router.get("/goal/:goalId", getSessionsByGoal);
router.put("/:id", updateSession);
router.delete("/:id", deleteSession);

module.exports = router;
