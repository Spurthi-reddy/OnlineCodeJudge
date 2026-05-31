import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import { submitToJudge, pollSubmissionStatus } from '../services/judge0.js';

// @desc    Run code against sample test cases (does not save submission history)
// @route   POST /api/submissions/run
// @access  Private
export const runCode = async (req, res) => {
  const { code, language, problemId } = req.body;

  try {
    if (!code || !language || !problemId) {
      return res.status(400).json({ success: false, message: 'Code, language, and problemId are required' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const testCases = problem.sampleTestCases;
    const results = [];

    // Run each sample test case
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      
      // Dispatch code execution request
      const execution = await submitToJudge(code, language, tc.input, tc.output);
      
      let executionResult;
      // If it returned a token, poll for the actual status
      if (execution.token) {
        executionResult = await pollSubmissionStatus(execution.token);
      } else {
        // If mocked, results are returned directly
        executionResult = execution;
      }

      // Check correctness
      const cleanStdout = (executionResult.stdout || '').trim();
      const cleanExpected = tc.output.trim();
      const passed = executionResult.status === 'Accepted' && 
                     (cleanStdout === cleanExpected || cleanStdout.replace(/\s+/g, '') === cleanExpected.replace(/\s+/g, ''));

      results.push({
        testCaseIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.output,
        actualOutput: cleanStdout,
        passed,
        status: passed ? 'Accepted' : (executionResult.status === 'Accepted' ? 'Wrong Answer' : executionResult.status),
        runtime: executionResult.runtime,
        memory: executionResult.memory,
        errorLog: executionResult.errorLog,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Code run completed',
      results,
    });
  } catch (error) {
    console.error('Run code controller error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit code against full test cases (saves submission and updates points)
// @route   POST /api/submissions/submit
// @access  Private
export const submitCode = async (req, res) => {
  const { code, language, problemId } = req.body;
  const userId = req.user.id;

  try {
    if (!code || !language || !problemId) {
      return res.status(400).json({ success: false, message: 'Code, language, and problemId are required' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Save initial Pending submission in DB
    const submission = await Submission.create({
      problem: problemId,
      user: userId,
      code,
      language,
      status: 'Processing',
    });

    // Combine sample and hidden test cases for full verification
    const allTestCases = [...problem.sampleTestCases, ...problem.hiddenTestCases];
    let finalStatus = 'Accepted';
    let maxRuntime = 0;
    let maxMemory = 0;
    let errorLog = '';
    let failingTestCase = null;

    // Run test cases. In competitive programming, we stop at the first failing test case.
    for (let i = 0; i < allTestCases.length; i++) {
      const tc = allTestCases[i];
      const execution = await submitToJudge(code, language, tc.input, tc.output);
      
      let executionResult;
      if (execution.token) {
        // Track the token in the DB
        submission.executionToken = execution.token;
        await submission.save();
        executionResult = await pollSubmissionStatus(execution.token);
      } else {
        executionResult = execution;
      }

      maxRuntime = Math.max(maxRuntime, executionResult.runtime || 0);
      maxMemory = Math.max(maxMemory, executionResult.memory || 0);

      const cleanStdout = (executionResult.stdout || '').trim();
      const cleanExpected = tc.output.trim();
      const isCorrect = executionResult.status === 'Accepted' && 
                        (cleanStdout === cleanExpected || cleanStdout.replace(/\s+/g, '') === cleanExpected.replace(/\s+/g, ''));

      if (!isCorrect) {
        finalStatus = executionResult.status === 'Accepted' ? 'Wrong Answer' : executionResult.status;
        errorLog = executionResult.errorLog || `Output mismatch on testcase ${i+1}.`;
        failingTestCase = {
          input: tc.input,
          expected: tc.output,
          actual: cleanStdout,
        };
        break; // Stop at first failing test case
      }
    }

    // Save final submission details
    submission.status = finalStatus;
    submission.runtime = maxRuntime;
    submission.memory = maxMemory;
    submission.errorLog = errorLog;
    await submission.save();

    // If solution is accepted, update user stats
    if (finalStatus === 'Accepted') {
      const user = await User.findById(userId);
      
      // Update solved problems list and add points if not solved before
      const hasSolvedBefore = user.solvedProblems.includes(problemId);
      if (!hasSolvedBefore) {
        user.solvedProblems.push(problemId);
        user.points += problem.points || 10;
        await user.save();
      }
    }

    // Calculate dynamic acceptance rate for the problem
    const totalSubmissions = await Submission.countDocuments({ problem: problemId });
    const acceptedSubmissions = await Submission.countDocuments({ problem: problemId, status: 'Accepted' });
    problem.acceptanceRate = totalSubmissions > 0 ? parseFloat(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)) : 0;
    await problem.save();

    res.status(200).json({
      success: true,
      submission,
      failingTestCase, // Only populated if WA/TLE/RTE
    });
  } catch (error) {
    console.error('Submit code controller error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get submission history (user-specific or problem-specific)
// @route   GET /api/submissions
// @access  Private
export const getSubmissionHistory = async (req, res) => {
  try {
    const { problemId } = req.query;
    let query = { user: req.user.id };

    if (problemId) {
      query.problem = problemId;
    }

    const submissions = await Submission.find(query)
      .populate('problem', 'title slug difficulty')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get live leaderboards
// @route   GET /api/submissions/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
  try {
    // Sort users by points in descending order
    const users = await User.find({})
      .select('name email points solvedProblems')
      .sort({ points: -1 })
      .limit(50);

    const rankings = users.map((user, idx) => ({
      rank: idx + 1,
      name: user.name,
      points: user.points,
      solvedCount: user.solvedProblems.length,
      isCurrentUser: req.user ? user._id.toString() === req.user.id.toString() : false,
    }));

    res.status(200).json({ success: true, leaderboard: rankings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get runtime/memory historical analytics curve for a specific problem
// @route   GET /api/submissions/performance/:problemId
// @access  Private
export const getProblemPerformanceCurve = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;

    // Fetch successful submissions for this user
    const userSubmissions = await Submission.find({
      problem: problemId,
      user: userId,
      status: 'Accepted',
    })
      .sort({ createdAt: 1 }) // Chronological order
      .select('runtime memory createdAt');

    // Fetch community statistics (average runtimes for this problem)
    const allSuccessfulSubmissions = await Submission.find({
      problem: problemId,
      status: 'Accepted',
    })
      .select('runtime memory');

    const communityRuntimes = allSuccessfulSubmissions.map(s => s.runtime);
    const communityAverage = communityRuntimes.length > 0
      ? parseFloat((communityRuntimes.reduce((a, b) => a + b, 0) / communityRuntimes.length).toFixed(1))
      : 0;

    const formattedHistory = userSubmissions.map((s, idx) => ({
      attempt: `Attempt ${idx + 1}`,
      runtime: s.runtime,
      memory: parseFloat((s.memory / 1024).toFixed(2)), // in MB
      communityAverage,
      date: new Date(s.createdAt).toLocaleDateString(),
    }));

    res.status(200).json({
      success: true,
      history: formattedHistory,
      communityStats: {
        totalPassedCount: allSuccessfulSubmissions.length,
        averageRuntime: communityAverage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
