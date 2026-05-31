import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';

// Route files
import authRoutes from './routes/authRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Seed data
import Problem from './models/Problem.js';
import User from './models/User.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
  })
);


// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ai', aiRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

// Export app for Vercel Serverless compatibility
export default app;

// Start server if not running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    seedDatabase();
  });
} else {
  // Run seeding checks on serverless startup
  seedDatabase();
}

/**
 * Auto-Seed database with sample problems & users for out-of-the-box operation
 */
async function seedDatabase() {
  try {
    const problemCount = await Problem.countDocuments();
    const userCount = await User.countDocuments();

    // Migration: Update any existing problems missing a slug
    const sluglessProblems = await Problem.find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }],
    });
    if (sluglessProblems.length > 0) {
      console.log(`Migrating ${sluglessProblems.length} slugless problems...`);
      for (const prob of sluglessProblems) {
        prob.slug = prob.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        await prob.save();
      }
      console.log('Migration completed successfully!');
    }

    if (userCount === 0) {
      console.log('Seeding default users...');
      // Seed User
      await User.create({
        name: 'Demo Coder',
        email: 'user@example.com',
        password: 'password123',
        role: 'User',
        points: 0,
      });

      // Seed Admin
      await User.create({
        name: 'Platform Creator',
        email: 'admin@example.com',
        password: 'password123',
        role: 'Admin',
        points: 100,
      });
      console.log('Default users seeded (User: user@example.com, Admin: admin@example.com, password: password123)');
    }

    if (problemCount < 20) {
      console.log('Seeding starter coding problems...');

      const admin = await User.findOne({ role: 'Admin' });
      const adminId = admin ? admin._id : null;

      const sampleProblems = [
        {
          title: 'Two Sum',
          description: `Given an array of integers 'nums' and an integer 'target', return indices of the two numbers such that they add up to 'target'. You may assume that each input has exactly one solution and you may not use the same element twice.`,
          difficulty: 'Easy',
          categoryTags: ['Arrays', 'Hash Table'],
          constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
          sampleTestCases: [
            { input: '[2,7,11,15]\n9', output: '[0,1]', explanation: 'Two numbers 2 and 7 add to 9.' },
            { input: '[3,2,4]\n6', output: '[1,2]', explanation: 'Two numbers 2 and 4 add to 6.' }
          ],
          hiddenTestCases: [
            { input: '[3,3]\n6', output: '[0,1]' },
            { input: '[2,5,5,11]\n10', output: '[1,2]' }
          ],
          points: 15,
          author: adminId,
        },
        {
          title: 'Palindrome Number',
          description: `Given an integer 'x', return true if x is a palindrome, and false otherwise. An integer is a palindrome when it reads the same backward and forward.`,
          difficulty: 'Easy',
          categoryTags: ['Math', 'Two Pointers'],
          constraints: ['-2^31 <= x <= 2^31 - 1'],
          sampleTestCases: [
            { input: '121', output: 'true', explanation: '121 reads the same forwards and backwards.' },
            { input: '-121', output: 'false', explanation: 'Negative numbers are not palindromes.' }
          ],
          hiddenTestCases: [
            { input: '10', output: 'false' },
            { input: '0', output: 'true' }
          ],
          points: 10,
          author: adminId,
        },
        {
          title: 'Reverse Integer',
          description: `Reverse digits of a signed 32-bit integer. If reversing causes the value to go outside the signed 32-bit integer range, return 0.`,
          difficulty: 'Easy',
          categoryTags: ['Math', 'String'],
          constraints: ['-2^31 <= x <= 2^31 - 1'],
          sampleTestCases: [
            { input: '123', output: '321', explanation: 'Reverse positive digits.' },
            { input: '-123', output: '-321', explanation: 'Reverse negative digits.' }
          ],
          hiddenTestCases: [
            { input: '1534236469', output: '0' },
            { input: '120', output: '21' }
          ],
          points: 10,
          author: adminId,
        },
        {
          title: 'Merge Two Sorted Lists',
          description: `Merge two sorted linked lists and return a new sorted list by splicing together the nodes of the first two lists.`,
          difficulty: 'Easy',
          categoryTags: ['Linked List', 'Recursion'],
          constraints: ['The lists are sorted in non-decreasing order.'],
          sampleTestCases: [
            { input: '[1,2,4]\n[1,3,4]', output: '[1,1,2,3,4,4]', explanation: 'Merge sorted values.' },
            { input: '[]\n[]', output: '[]', explanation: 'Both lists empty yields empty list.' }
          ],
          hiddenTestCases: [
            { input: '[]\n[0]', output: '[0]' },
            { input: '[2,5,7]\n[3,11]', output: '[2,3,5,7,11]' }
          ],
          points: 12,
          author: adminId,
        },
        {
          title: 'Valid Parentheses',
          description: `Given a string containing only parentheses, determine if the input string is valid. An input string is valid when open brackets are closed by the same type of brackets in the correct order.`,
          difficulty: 'Easy',
          categoryTags: ['Stack', 'String'],
          constraints: ['1 <= s.length <= 10^4'],
          sampleTestCases: [
            { input: '()', output: 'true', explanation: 'Simple matching pair.' },
            { input: '([)]', output: 'false', explanation: 'Incorrect bracket ordering.' }
          ],
          hiddenTestCases: [
            { input: '()[]{}', output: 'true' },
            { input: '(]', output: 'false' }
          ],
          points: 10,
          author: adminId,
        },
        {
          title: 'Best Time to Buy and Sell Stock',
          description: `Given an array where the i-th element is the price of a given stock on day i, find the maximum profit from at most one transaction.`,
          difficulty: 'Easy',
          categoryTags: ['Array', 'Dynamic Programming'],
          constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
          sampleTestCases: [
            { input: '[7,1,5,3,6,4]', output: '5', explanation: 'Buy at 1 and sell at 6.' },
            { input: '[7,6,4,3,1]', output: '0', explanation: 'No profitable transaction.' }
          ],
          hiddenTestCases: [
            { input: '[1,2]', output: '1' },
            { input: '[2,4,1]', output: '2' }
          ],
          points: 12,
          author: adminId,
        },
        {
          title: 'Maximum Subarray',
          description: `Find the contiguous subarray with the largest sum and return its sum.`,
          difficulty: 'Easy',
          categoryTags: ['Array', 'Dynamic Programming'],
          constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
          sampleTestCases: [
            { input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has max sum.' },
            { input: '[1]', output: '1', explanation: 'Single element array.' }
          ],
          hiddenTestCases: [
            { input: '[-1]', output: '-1' },
            { input: '[-2,-1]', output: '-1' }
          ],
          points: 12,
          author: adminId,
        },
        {
          title: 'Intersection of Two Arrays II',
          description: `Given two arrays, return an array of their intersection. Each element in the result should appear as many times as it shows in both arrays.`,
          difficulty: 'Easy',
          categoryTags: ['Array', 'Hash Table'],
          constraints: ['1 <= nums1.length, nums2.length <= 1000', '0 <= nums[i] <= 1000'],
          sampleTestCases: [
            { input: '[1,2,2,1]\n[2,2]', output: '[2,2]', explanation: 'The number 2 appears twice in both arrays.' },
            { input: '[4,9,5]\n[9,4,9,8,4]', output: '[4,9]', explanation: 'Intersection contains 4 and 9.' }
          ],
          hiddenTestCases: [
            { input: '[1,1,2]\n[1,1]', output: '[1,1]' },
            { input: '[]\n[1,2]', output: '[]' }
          ],
          points: 10,
          author: adminId,
        },
        {
          title: 'Fizz Buzz',
          description: `Output the string representation of numbers from 1 to n with special cases: multiples of 3 are 'Fizz', multiples of 5 are 'Buzz', and multiples of both are 'FizzBuzz'.`,
          difficulty: 'Easy',
          categoryTags: ['Math', 'String'],
          constraints: ['1 <= n <= 10^4'],
          sampleTestCases: [
            { input: '3', output: '[1,2,Fizz]', explanation: '3 is divisible by 3.' },
            { input: '5', output: '[1,2,Fizz,4,Buzz]', explanation: '5 is divisible by 5.' }
          ],
          hiddenTestCases: [
            { input: '15', output: '[1,2,Fizz,4,Buzz,Fizz,7,8,Fizz,Buzz,11,Fizz,13,14,FizzBuzz]' },
            { input: '1', output: '[1]' }
          ],
          points: 8,
          author: adminId,
        },
        {
          title: 'Climbing Stairs',
          description: `Each time you can climb 1 or 2 steps. Count how many distinct ways you can reach the top of a staircase with n steps.`,
          difficulty: 'Easy',
          categoryTags: ['Dynamic Programming'],
          constraints: ['1 <= n <= 45'],
          sampleTestCases: [
            { input: '2', output: '2', explanation: 'Ways: 1+1 or 2.' },
            { input: '3', output: '3', explanation: 'Ways: 1+1+1, 1+2, 2+1.' }
          ],
          hiddenTestCases: [
            { input: '1', output: '1' },
            { input: '4', output: '5' }
          ],
          points: 10,
          author: adminId,
        },
        {
          title: 'Add Two Numbers',
          description: `Add two numbers represented by linked lists. The digits are stored in reverse order and each node contains a single digit.`,
          difficulty: 'Medium',
          categoryTags: ['Linked List', 'Math'],
          constraints: ['The numbers do not contain leading zeros except the number 0 itself.'],
          sampleTestCases: [
            { input: '[2,4,3]\n[5,6,4]', output: '[7,0,8]', explanation: '342 + 465 = 807.' },
            { input: '[0]\n[0]', output: '[0]', explanation: 'Zero plus zero remains zero.' }
          ],
          hiddenTestCases: [
            { input: '[9,9,9,9,9,9,9]\n[9,9,9,9]', output: '[8,9,9,9,0,0,0,1]' },
            { input: '[1]\n[9,9]', output: '[0,0,1]' }
          ],
          points: 20,
          author: adminId,
        },
        {
          title: 'Longest Substring Without Repeating Characters',
          description: `Given a string, find the length of the longest substring without repeating characters.`,
          difficulty: 'Medium',
          categoryTags: ['Hash Table', 'Sliding Window'],
          constraints: ['0 <= s.length <= 5 * 10^4'],
          sampleTestCases: [
            { input: 'abcabcbb', output: '3', explanation: 'The substring abc has no repeats.' },
            { input: 'bbbbb', output: '1', explanation: 'The substring b has no repeats.' }
          ],
          hiddenTestCases: [
            { input: 'pwwkew', output: '3' },
            { input: '', output: '0' }
          ],
          points: 20,
          author: adminId,
        },
        {
          title: 'Letter Combinations of a Phone Number',
          description: `Given digits from 2-9, return all possible letter combinations the number could represent using the telephone keypad mapping.`,
          difficulty: 'Medium',
          categoryTags: ['Backtracking', 'String'],
          constraints: ['0 <= digits.length <= 4'],
          sampleTestCases: [
            { input: '23', output: '[ad,ae,af,bd,be,bf,cd,ce,cf]', explanation: 'Digits 2 and 3 map to letters.' },
            { input: '', output: '[]', explanation: 'Empty input creates no combinations.' }
          ],
          hiddenTestCases: [
            { input: '7', output: '[pqrs]' },
            { input: '9', output: '[wxyz]' }
          ],
          points: 18,
          author: adminId,
        },
        {
          title: '3Sum',
          description: `Find all unique triplets in the array which give the sum of zero.`,
          difficulty: 'Medium',
          categoryTags: ['Array', 'Two Pointers'],
          constraints: ['0 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5'],
          sampleTestCases: [
            { input: '[-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]', explanation: 'Two unique triplets sum to zero.' },
            { input: '[]', output: '[]', explanation: 'No triplets available.' }
          ],
          hiddenTestCases: [
            { input: '[0,0,0,0]', output: '[[0,0,0]]' },
            { input: '[1,-1,-1,0]', output: '[[-1,0,1]]' }
          ],
          points: 22,
          author: adminId,
        },
        {
          title: 'Container With Most Water',
          description: `Given heights, find two lines that together form a container with the most water. Return the maximum area.`,
          difficulty: 'Medium',
          categoryTags: ['Two Pointers', 'Greedy'],
          constraints: ['2 <= height.length <= 10^5', '0 <= height[i] <= 10^4'],
          sampleTestCases: [
            { input: '[1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'Max area is formed by height 8 and 7.' },
            { input: '[1,1]', output: '1', explanation: 'Only one possible container.' }
          ],
          hiddenTestCases: [
            { input: '[4,3,2,1,4]', output: '16' },
            { input: '[1,2,1]', output: '2' }
          ],
          points: 20,
          author: adminId,
        },
        {
          title: 'Median of Two Sorted Arrays',
          description: `Find the median of two sorted arrays in O(log(m+n)) time.`,
          difficulty: 'Hard',
          categoryTags: ['Binary Search', 'Divide and Conquer'],
          constraints: ['0 <= m, n <= 1000', '-10^6 <= nums[i] <= 10^6'],
          sampleTestCases: [
            { input: '[1,3]\n[2]', output: '2.0', explanation: 'Merged sorted list is [1,2,3]. Median is 2.' },
            { input: '[1,2]\n[3,4]', output: '2.5', explanation: 'Merged list is [1,2,3,4]. Median is 2.5.' }
          ],
          hiddenTestCases: [
            { input: '[]\n[1]', output: '1.0' },
            { input: '[0,0]\n[0,0]', output: '0.0' }
          ],
          points: 35,
          author: adminId,
        },
        {
          title: 'Regular Expression Matching',
          description: `Implement regular expression matching with support for '.' and '*'. '.' Matches any single character, and '*' matches zero or more of the preceding element.`,
          difficulty: 'Hard',
          categoryTags: ['String', 'Dynamic Programming'],
          constraints: ['0 <= s.length <= 20', '0 <= p.length <= 30'],
          sampleTestCases: [
            { input: 'aa\na', output: 'false', explanation: 'Pattern a does not match aa.' },
            { input: 'ab\n.*', output: 'true', explanation: '.* matches any string of length 2.' }
          ],
          hiddenTestCases: [
            { input: 'aab\nc*a*b', output: 'true' },
            { input: 'mississippi\nmis*is*p*.', output: 'false' }
          ],
          points: 35,
          author: adminId,
        },
        {
          title: 'Largest Rectangle in Histogram',
          description: `Given bar heights in a histogram, compute the area of the largest rectangle that can be formed.`,
          difficulty: 'Hard',
          categoryTags: ['Stack', 'Array'],
          constraints: ['1 <= heights.length <= 10^5', '0 <= heights[i] <= 10^4'],
          sampleTestCases: [
            { input: '[2,1,5,6,2,3]', output: '10', explanation: 'Max rectangle area is 10.' },
            { input: '[2,4]', output: '4', explanation: 'Max height 2 by width 2 or height 4 by width 1.' }
          ],
          hiddenTestCases: [
            { input: '[0,0,0]', output: '0' },
            { input: '[1]', output: '1' }
          ],
          points: 30,
          author: adminId,
        },
        {
          title: 'Word Search II',
          description: `Given a board and a list of words, return all words that can be formed from letters of sequentially adjacent cells.`,
          difficulty: 'Hard',
          categoryTags: ['Backtracking', 'Trie'],
          constraints: ['1 <= board.length, board[i].length <= 12', '1 <= words.length <= 3 * 10^4'],
          sampleTestCases: [
            { input: '[[o,a,a,n],[e,t,a,e],[i,h,k,r],[i,f,l,v]]\n[oa,pea,eat,eat]', output: '[eat,oa]', explanation: 'Words eat and oa can be found.' },
            { input: '[[a,b],[c,d]]\n[ab,cb,ad]', output: '[ab]', explanation: 'Only ab can be constructed.' }
          ],
          hiddenTestCases: [
            { input: '[[a]]\n[a]', output: '[a]' },
            { input: '[[a,b,c],[a,d,e],[a,f,g]]\n[abc,afg]', output: '[abc,afg]' }
          ],
          points: 38,
          author: adminId,
        },
        {
          title: 'Trapping Rain Water',
          description: `Given an elevation map, compute how much water it can trap after raining.`,
          difficulty: 'Hard',
          categoryTags: ['Array', 'Two Pointers'],
          constraints: ['n == height.length', '0 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
          sampleTestCases: [
            { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'Total trapped water is 6.' },
            { input: '[4,2,0,3,2,5]', output: '9', explanation: 'Total trapped water is 9.' }
          ],
          hiddenTestCases: [
            { input: '[0,0,0]', output: '0' },
            { input: '[5,4,1,2]', output: '1' }
          ],
          points: 35,
          author: adminId,
        }
      ];

      const existingProblems = await Problem.find({}, 'title');
      const existingTitles = new Set(existingProblems.map((p) => p.title));
      const missingProblems = sampleProblems.filter((problem) => !existingTitles.has(problem.title));

      if (missingProblems.length > 0) {
        for (const problem of missingProblems) {
          const slug = problem.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

          await Problem.findOneAndUpdate(
            { title: problem.title },
            { ...problem, slug },
            {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true,
            }
          );
        }
        console.log(`${missingProblems.length} sample problems seeded successfully!`);
      } else {
        console.log('Sample problems already exist or enough problems are already seeded.');
      }
    }
  } catch (error) {
    console.error('Seeding database error:', error);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process in standard node environments
  // server.close(() => process.exit(1));
});
