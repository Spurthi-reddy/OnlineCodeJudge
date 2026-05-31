import Problem from '../models/Problem.js';

// @desc    Get all problems with search, filtering, and stats
// @route   GET /api/problems
// @access  Public
export const getProblems = async (req, res) => {
  try {
    const { search, difficulty, tag } = req.query;
    let query = {};

    // Apply text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Apply difficulty filter
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Apply tag filter
    if (tag) {
      query.categoryTags = tag;
    }

    const problems = await Problem.find(query)
      .select('-hiddenTestCases') // Hide full/secret test cases for security
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: problems.length, problems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single problem by ID or slug
// @route   GET /api/problems/:identifier
// @access  Public
export const getProblemByIdOrSlug = async (req, res) => {
  const { identifier } = req.params;

  try {
    let problem;
    // Check if it is a valid ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      problem = await Problem.findById(identifier);
    } else {
      problem = await Problem.findOne({ slug: identifier });
    }

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Convert to object and strip hidden test cases
    const problemData = problem.toObject();
    delete problemData.hiddenTestCases;

    res.status(200).json({ success: true, problem: problemData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a problem
// @route   POST /api/problems
// @access  Private/Admin
export const createProblem = async (req, res) => {
  try {
    const problem = await Problem.create({
      ...req.body,
      author: req.user.id,
    });
    res.status(201).json({ success: true, problem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a problem
// @route   PUT /api/problems/:id
// @access  Private/Admin
export const updateProblem = async (req, res) => {
  try {
    let problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a problem
// @route   DELETE /api/problems/:id
// @access  Private/Admin
export const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    await problem.deleteOne();
    res.status(200).json({ success: true, message: 'Problem removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all unique categories / tags
// @route   GET /api/problems/categories/tags
// @access  Public
export const getProblemCategories = async (req, res) => {
  try {
    const tags = await Problem.distinct('categoryTags');
    res.status(200).json({ success: true, tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
