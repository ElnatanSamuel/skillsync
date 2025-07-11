const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createGoal = async (req, res) => {
  const { title, userId, frequency = 0 } = req.body;

  console.log("Received create goal request:", req.body);

  if (!title) {
    return res.status(400).json({ error: "Missing title" });
  }

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  if (isNaN(Number(userId))) {
    return res
      .status(400)
      .json({ error: "Invalid userId format, must be a number" });
  }

  try {
    console.log("Creating goal with data:", {
      title,
      userId: Number(userId),
      frequency: Number(frequency),
      nextDueDate: frequency > 0 ? new Date() : null,
    });

    const goal = await prisma.goal.create({
      data: {
        title,
        user: { connect: { id: Number(userId) } },
        frequency: Number(frequency),
        nextDueDate: frequency > 0 ? new Date() : null,
      },
    });

    console.log("Goal created successfully:", goal);
    res.status(201).json(goal);
  } catch (error) {
    console.error("Create goal error:", error);

    // More specific error handling
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Failed to create goal: User not found",
        details: error.message,
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Failed to create goal: A similar goal already exists",
        details: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to create goal",
      details: error.message,
    });
  }
};

exports.getUserGoals = async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) return res.status(400).json({ error: "Invalid userId" });

  const goals = await prisma.goal.findMany({
    where: { userId },
    include: { sessions: true },
  });
  res.json(goals);
};

exports.getGoals = async (req, res) => {
  const { userId } = req.query;
  console.log("userId from query:", userId); // Add this line

  if (!userId || isNaN(Number(userId))) {
    return res
      .status(400)
      .json({ message: "Missing or invalid userId in query" });
  }

  try {
    const goals = await prisma.goal.findMany({
      where: { userId: Number(userId) },
      orderBy: { id: "desc" },
    });

    res.json(goals);
  } catch (err) {
    console.error("Fetch goals error:", err);
    res.status(500).json({ message: "Failed to fetch goals" });
  }
};

exports.updateGoal = async (req, res) => {
  const { id } = req.params;
  const { title, frequency, nextDueDate } = req.body;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: "Invalid goal ID" });
  }

  try {
    const goal = await prisma.goal.update({
      where: { id: Number(id) },
      data: {
        ...(title && { title }),
        ...(frequency !== undefined && { frequency: Number(frequency) }),
        ...(nextDueDate && { nextDueDate: new Date(nextDueDate) }),
      },
    });

    res.json(goal);
  } catch (err) {
    console.error("Update goal error:", err);
    res.status(500).json({ message: "Failed to update goal" });
  }
};

exports.getScheduledGoals = async (req, res) => {
  const { userId } = req.query;

  if (!userId || isNaN(Number(userId))) {
    return res
      .status(400)
      .json({ message: "Missing or invalid userId in query" });
  }

  try {
    const goals = await prisma.goal.findMany({
      where: {
        userId: Number(userId),
        frequency: { gt: 0 }, // Only get goals with a frequency set
      },
      include: {
        sessions: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
      orderBy: { nextDueDate: "asc" },
    });

    // Add status information to each goal
    const goalsWithStatus = goals.map((goal) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let status = "upcoming";

      if (goal.nextDueDate) {
        const dueDate = new Date(goal.nextDueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {
          status = "overdue";
        } else if (dueDate.getTime() === today.getTime()) {
          status = "due-today";
        }
      }

      return {
        ...goal,
        status,
      };
    });

    res.json(goalsWithStatus);
  } catch (err) {
    console.error("Fetch scheduled goals error:", err);
    res.status(500).json({ message: "Failed to fetch scheduled goals" });
  }
};

exports.deleteGoal = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: "Invalid goal ID" });
  }

  try {
    // Check if goal exists
    const goalExists = await prisma.goal.findUnique({
      where: { id: Number(id) },
    });

    if (!goalExists) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Delete related sessions first to avoid foreign key constraint errors
    await prisma.session.deleteMany({
      where: { goalId: Number(id) },
    });

    // Delete the goal
    await prisma.goal.delete({
      where: { id: Number(id) },
    });

    res
      .status(200)
      .json({ message: "Goal and related sessions deleted successfully", id });
  } catch (err) {
    console.error("Delete goal error:", err);
    res.status(500).json({ message: "Failed to delete goal" });
  }
};
