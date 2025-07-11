const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Update goal scheduling information
const updateGoalScheduling = async (goalId, completed = false) => {
  if (!completed) return;

  try {
    // Get the goal to check frequency
    const goal = await prisma.goal.findUnique({
      where: { id: Number(goalId) },
    });

    if (!goal || goal.frequency <= 0) return; // Skip if no frequency set

    const now = new Date();

    // Calculate next due date based on frequency
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + goal.frequency);

    // Update the goal with new lastCompleted and nextDueDate
    await prisma.goal.update({
      where: { id: Number(goalId) },
      data: {
        lastCompleted: now,
        nextDueDate,
      },
    });
  } catch (err) {
    console.error("Error updating goal scheduling:", err);
  }
};

// POST /api/sessions
exports.createSession = async (req, res) => {
  const {
    goalId,
    date,
    duration,
    completed = false,
    title = "",
    note = "",
  } = req.body;

  try {
    // If no title is provided, get the goal title to use instead of "Quick completion"
    let sessionTitle = title;
    if (!sessionTitle || sessionTitle === "Quick completion") {
      const goal = await prisma.goal.findUnique({
        where: { id: Number(goalId) },
      });

      if (goal) {
        sessionTitle = `${goal.title} session`;
      }
    }

    const session = await prisma.session.create({
      data: {
        goalId: Number(goalId),
        date: new Date(date),
        duration: Number(duration),
        completed,
        title: sessionTitle,
        note,
      },
      include: {
        goal: true,
      },
    });

    // If the session is marked as completed, update the goal's schedule
    if (completed) {
      await updateGoalScheduling(goalId, completed);
    }

    res.status(201).json(session);
  } catch (err) {
    console.error("Create session error:", err);
    res.status(500).json({ message: "Failed to create session" });
  }
};

exports.getSessionsByGoal = async (req, res) => {
  const { goalId } = req.params;

  try {
    const sessions = await prisma.session.findMany({
      where: { goalId: Number(goalId) },
      include: { goal: true },
      orderBy: { date: "desc" },
    });

    res.json(sessions);
  } catch (err) {
    console.error("Fetch sessions error:", err);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
};

// PUT /api/sessions/:id
exports.updateSession = async (req, res) => {
  const { id } = req.params;
  const { completed, title, note, duration, date } = req.body;

  try {
    // Get the current session to know if we're changing completion status
    const currentSession = await prisma.session.findUnique({
      where: { id: Number(id) },
      include: { goal: true },
    });

    // If we're marking as completed and there's no title, use the goal title
    let sessionTitle = title;
    if (
      completed &&
      (!currentSession.title || currentSession.title === "Quick completion")
    ) {
      if (currentSession.goal) {
        sessionTitle = `${currentSession.goal.title} session`;
      }
    }

    // Update the session
    const session = await prisma.session.update({
      where: { id: Number(id) },
      data: {
        ...(completed !== undefined && { completed }),
        ...(sessionTitle !== undefined && { title: sessionTitle }),
        ...(note !== undefined && { note }),
        ...(duration !== undefined && { duration: Number(duration) }),
        ...(date !== undefined && { date: new Date(date) }),
      },
      include: { goal: true },
    });

    // If completion status changed to completed, update the goal's schedule
    if (
      completed &&
      (!currentSession.completed || currentSession.completed !== completed)
    ) {
      await updateGoalScheduling(session.goalId, true);
    }

    res.json(session);
  } catch (err) {
    console.error("Update session error:", err);
    res.status(500).json({ message: "Failed to update session" });
  }
};

// DELETE /api/sessions/:id
exports.deleteSession = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: Number(id) },
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Delete the session
    await prisma.session.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Session deleted successfully", id });
  } catch (err) {
    console.error("Delete session error:", err);
    res.status(500).json({ message: "Failed to delete session" });
  }
};

// Get all sessions for a user
exports.getSessions = async (req, res) => {
  const { userId } = req.query;

  if (!userId || isNaN(Number(userId))) {
    return res
      .status(400)
      .json({ message: "Missing or invalid userId in query" });
  }

  try {
    const sessions = await prisma.session.findMany({
      where: {
        goal: {
          userId: Number(userId),
        },
      },
      include: { goal: true },
      orderBy: { date: "desc" },
    });

    res.json(sessions);
  } catch (err) {
    console.error("Fetch all sessions error:", err);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
};
