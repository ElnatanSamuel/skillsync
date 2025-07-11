import { useState } from "react";

const SmartRecommendations = ({ sessions = [], goals = [] }) => {
  const [showAll, setShowAll] = useState(false);

  if (!sessions.length || !goals.length) {
    return null;
  }

  // Calculate the most skipped sessions
  const getSkippedSessions = () => {
    // Group sessions by goal
    const sessionsByGoal = {};
    goals.forEach((goal) => {
      sessionsByGoal[goal.id] = {
        goal,
        sessions: sessions.filter((session) => session.goalId === goal.id),
        skipCount: 0,
      };
    });

    // Analyze session frequency and identify gaps
    Object.values(sessionsByGoal).forEach((group) => {
      if (group.sessions.length < 2) return;

      // Sort sessions by date
      const sortedSessions = [...group.sessions].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Calculate average days between sessions
      let totalGapDays = 0;
      let gapCount = 0;

      for (let i = 1; i < sortedSessions.length; i++) {
        const current = new Date(sortedSessions[i].date);
        const prev = new Date(sortedSessions[i - 1].date);
        const gap = Math.floor((current - prev) / (1000 * 60 * 60 * 24));

        if (gap > 0) {
          totalGapDays += gap;
          gapCount++;
        }
      }

      const avgGap = gapCount > 0 ? Math.round(totalGapDays / gapCount) : 0;

      // Count gaps that are significantly larger than average (potential skips)
      let skipCount = 0;
      for (let i = 1; i < sortedSessions.length; i++) {
        const current = new Date(sortedSessions[i].date);
        const prev = new Date(sortedSessions[i - 1].date);
        const gap = Math.floor((current - prev) / (1000 * 60 * 60 * 24));

        // If gap is more than twice the average, consider it a skip
        if (avgGap > 0 && gap > avgGap * 2) {
          skipCount++;
        }
      }

      group.skipCount = skipCount;
      group.avgGap = avgGap;
    });

    // Sort goals by skip count and return top 3
    return Object.values(sessionsByGoal)
      .filter((group) => group.skipCount > 0)
      .sort((a, b) => b.skipCount - a.skipCount)
      .slice(0, 3);
  };

  // Calculate most consistent goals
  const getConsistentGoals = () => {
    const consistencyScores = goals.map((goal) => {
      const goalSessions = sessions.filter(
        (session) => session.goalId === goal.id
      );

      if (goalSessions.length < 3) {
        return { goal, score: 0 };
      }

      // Sort sessions by date
      const sortedSessions = [...goalSessions].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Calculate standard deviation of gaps between sessions
      // Lower std dev means more consistency
      const gaps = [];
      for (let i = 1; i < sortedSessions.length; i++) {
        const current = new Date(sortedSessions[i].date);
        const prev = new Date(sortedSessions[i - 1].date);
        const gap = Math.floor((current - prev) / (1000 * 60 * 60 * 24));
        gaps.push(gap);
      }

      const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
      const variance =
        gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) /
        gaps.length;
      const stdDev = Math.sqrt(variance);

      // Combine frequency and consistency into a score
      // Higher is better
      const frequencyScore = goalSessions.length;
      const consistencyScore = stdDev === 0 ? 100 : 100 / stdDev;
      const completionRate =
        goalSessions.filter((s) => s.completed).length / goalSessions.length;

      const totalScore =
        frequencyScore * 0.4 +
        consistencyScore * 0.3 +
        completionRate * 100 * 0.3;

      return {
        goal,
        score: totalScore,
        sessionCount: goalSessions.length,
        completionRate: Math.round(completionRate * 100),
      };
    });

    // Sort by score and return top 3
    return consistencyScores
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  // Calculate the longest streak
  const getLongestStreak = () => {
    // Group all completed sessions by day
    const sessionsByDay = {};

    sessions.forEach((session) => {
      if (!session.completed) return;

      const date = new Date(session.date);
      const dateStr = date.toISOString().split("T")[0];

      if (!sessionsByDay[dateStr]) {
        sessionsByDay[dateStr] = [];
      }

      sessionsByDay[dateStr].push(session);
    });

    // Get all dates with completed sessions
    const dates = Object.keys(sessionsByDay).sort();

    if (dates.length === 0) {
      return { days: 0 };
    }

    // Find the longest consecutive streak
    let currentStreak = 1;
    let longestStreak = 1;
    let streakStart = dates[0];
    let streakEnd = dates[0];
    let longestStreakStart = dates[0];
    let longestStreakEnd = dates[0];

    for (let i = 1; i < dates.length; i++) {
      const currentDate = new Date(dates[i]);
      const prevDate = new Date(dates[i - 1]);

      // Check if dates are consecutive
      const diffDays = Math.round(
        (currentDate - prevDate) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        // Consecutive day
        currentStreak++;
        streakEnd = dates[i];

        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          longestStreakStart = streakStart;
          longestStreakEnd = streakEnd;
        }
      } else {
        // Streak broken
        currentStreak = 1;
        streakStart = dates[i];
        streakEnd = dates[i];
      }
    }

    // Get the most common goal during the streak
    const streakSessions = [];
    let currentDate = new Date(longestStreakStart);
    const endDate = new Date(longestStreakEnd);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      if (sessionsByDay[dateStr]) {
        streakSessions.push(...sessionsByDay[dateStr]);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count sessions by goal
    const goalCounts = {};
    streakSessions.forEach((session) => {
      if (!goalCounts[session.goalId]) {
        goalCounts[session.goalId] = 0;
      }
      goalCounts[session.goalId]++;
    });

    // Find the most common goal
    let maxCount = 0;
    let mostCommonGoalId = null;

    Object.entries(goalCounts).forEach(([goalId, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonGoalId = parseInt(goalId);
      }
    });

    const mostCommonGoal = goals.find((g) => g.id === mostCommonGoalId);

    return {
      days: longestStreak,
      startDate: new Date(longestStreakStart),
      endDate: new Date(longestStreakEnd),
      mostCommonGoal,
    };
  };

  const skippedSessions = getSkippedSessions();
  const consistentGoals = getConsistentGoals();
  const longestStreak = getLongestStreak();

  // Format date range
  const formatDateRange = (start, end) => {
    if (!start || !end) return "";
    const options = { month: "short", day: "numeric" };
    return `${start.toLocaleDateString(
      "en-US",
      options
    )} - ${end.toLocaleDateString("en-US", options)}`;
  };

  return (
    <div className="bg-zinc-900/70 backdrop-blur-sm rounded-lg p-5 border border-indigo-500/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-indigo-300">
          Smart Insights
        </h3>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-indigo-400 hover:text-indigo-300"
        >
          {showAll ? "Show Less" : "Show All"}
        </button>
      </div>

      <div className="space-y-4">
        {/* Longest Streak */}
        <div className="flex items-start gap-3">
          <div className="bg-indigo-600/20 p-2 rounded-lg">
            <span className="text-xl">🔥</span>
          </div>
          <div>
            <h4 className="font-medium text-white">
              Longest Streak: {longestStreak.days} days
            </h4>
            {longestStreak.days > 0 && (
              <p className="text-sm text-gray-400">
                {formatDateRange(
                  longestStreak.startDate,
                  longestStreak.endDate
                )}
                {longestStreak.mostCommonGoal && (
                  <span className="ml-1">
                    • Most frequent:{" "}
                    <span className="text-indigo-300">
                      {longestStreak.mostCommonGoal.title}
                    </span>
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Most Consistent Goals */}
        {(showAll || !skippedSessions.length) && consistentGoals.length > 0 && (
          <div className="flex items-start gap-3">
            <div className="bg-green-600/20 p-2 rounded-lg">
              <span className="text-xl">⭐</span>
            </div>
            <div>
              <h4 className="font-medium text-white">Most Consistent Goals</h4>
              <ul className="text-sm text-gray-400 mt-1">
                {consistentGoals.map((item) => (
                  <li key={item.goal.id} className="mb-1">
                    <span className="text-green-300">{item.goal.title}</span>
                    <span className="ml-1">
                      • {item.sessionCount} sessions • {item.completionRate}%
                      completion
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Skipped Sessions */}
        {skippedSessions.length > 0 && (
          <div className="flex items-start gap-3">
            <div className="bg-red-600/20 p-2 rounded-lg">
              <span className="text-xl">⏱️</span>
            </div>
            <div>
              <h4 className="font-medium text-white">Goals You're Skipping</h4>
              <ul className="text-sm text-gray-400 mt-1">
                {skippedSessions.map((item) => (
                  <li key={item.goal.id} className="mb-1">
                    <span className="text-red-300">{item.goal.title}</span>
                    <span className="ml-1">
                      • Skipped {item.skipCount} times • Typically every{" "}
                      {item.avgGap} days
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {showAll && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            These insights are calculated based on your {sessions.length}{" "}
            recorded sessions across {goals.length} goals.
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartRecommendations;
