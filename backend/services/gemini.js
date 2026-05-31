import dotenv from 'dotenv';
dotenv.config();

/**
 * Call the Gemini API to generate content.
 * Using fetch to avoid external SDK dependency issues on serverless functions.
 */
const callGeminiAPI = async (prompt, isJson = false) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  if (isJson) {
    payload.generationConfig = {
      responseMimeType: 'application/json',
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API call failed: ${response.statusText}. Details: ${errorText}`);
  }

  const data = await response.json();
  const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!outputText) {
    throw new Error('Empty response from Gemini API');
  }

  return outputText;
};

/**
 * Local high-quality mocks for AI Mentor when Gemini Key is absent
 */
const getMockAILogic = (problemTitle, userCode, verdict, input, expected, actual) => {
  const isTwoSum = problemTitle.toLowerCase().includes('two sum');
  const isPalindrome = problemTitle.toLowerCase().includes('palindrome');

  if (isTwoSum) {
    return {
      hint: 'Verify how you search for the complement (target - current). If you are using nested loops, it takes O(N^2) time. Think about using a Hash Map to store indices of numbers you have already visited, which can reduce the time complexity to O(N).',
      edgeCases: 'Check for duplicated numbers in the input array (e.g. [3, 3] with target 6), negative values, or target values that cannot be reached.',
      efficiency: 'Your solution might have a time complexity of O(N^2) if using nested loops. An optimal solution uses a Map for O(N) time complexity and O(N) space complexity.',
    };
  }

  return {
    hint: `Analyze the failed state on verdict "${verdict}". Look closely at variable initializations and pointer movements in your loop. Make sure you don't overshoot your array boundaries.`,
    edgeCases: 'Consider boundary constraints: empty array, single-element input, extremely large values, or values of opposite signs.',
    efficiency: 'Take a moment to verify if you can optimize your nested iterations. If you use recursion, verify if you are recalculating identical sub-states repeatedly.',
  };
};

/**
 * Local high-quality mocks for Edge Cases when Gemini Key is absent
 */
const getMockEdgeCases = (problemTitle) => {
  const isTwoSum = problemTitle.toLowerCase().includes('two sum');
  if (isTwoSum) {
    return [
      {
        input: '[3,3]\n6',
        expected: '[0,1]',
        description: 'Duplicate values inside the input array where target is their sum.',
      },
      {
        input: '[-1,-3,4,2]\n-4',
        expected: '[0,1]',
        description: 'Negative numbers in the array with a negative target sum.',
      },
    ];
  }

  return [
    {
      input: '[]',
      expected: '[]',
      description: 'Empty dataset input representing baseline boundaries.',
    },
    {
      input: '[0]',
      expected: '[0]',
      description: 'Single element input, checking core conditional stability.',
    },
  ];
};

/**
 * Service: AI Debugging sidecar (does not spoil final answer code)
 */
export const getAIPerformanceHints = async (problemTitle, problemDesc, userCode, language, verdict, input, expected, actual) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('[GEMINI] Using Mock AI Mentor (no API credentials detected)');
    return getMockAILogic(problemTitle, userCode, verdict, input, expected, actual);
  }

  const prompt = `
    You are an expert AI Coding Mentor on a platform similar to LeetCode. A user has submitted code that failed on the programming task "${problemTitle}".
    
    PROBLEM DESCRIPTION:
    ${problemDesc}
    
    SUBMISSION DETAILS:
    - Programming Language: ${language}
    - Judge Verdict: ${verdict}
    - Failing Test Case Input:
    ${input}
    - Expected Correct Output:
    ${expected}
    - Actual Code Output/Error:
    ${actual}
    
    USER CODE SUBMITTED:
    \`\`\`${language}
    ${userCode}
    \`\`\`
    
    YOUR INSTRUCTIONS:
    Provide constructive mentoring feedback.
    1. Highlight a structural/architectural hint (pointing to logical issues, off-by-one errors, or wrong variables).
    2. Outline potential edge-case vulnerabilities (like empty values, large numbers, negative bounds).
    3. Offer an evaluation of code runtime/memory efficiency.
    
    CRITICAL RESTRICTION:
    DO NOT provide any direct source code fixes or rewrite their logic. You must guide them so they write the fix themselves.
    
    You MUST output strictly in JSON format matching this structure:
    {
      "hint": "string containing structural hint",
      "edgeCases": "string describing potential edge cases",
      "efficiency": "string evaluating complexity"
    }
  `;

  try {
    const rawResult = await callGeminiAPI(prompt, true);
    return JSON.parse(rawResult.trim());
  } catch (error) {
    console.error('[GEMINI AI Mentor Error]', error);
    return getMockAILogic(problemTitle, userCode, verdict, input, expected, actual);
  }
};

/**
 * Service: Dynamic Blind-spot Edge-Case Generator
 */
export const generateEdgeCases = async (problemTitle, problemDesc, userCode, language) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('[GEMINI] Using Mock Edge-Case Generator (no API credentials detected)');
    return getMockEdgeCases(problemTitle);
  }

  const prompt = `
    You are an expert software QA engineer. A user is working on the coding problem "${problemTitle}".
    
    PROBLEM DETAILS:
    ${problemDesc}
    
    USER'S CODE DRAFT:
    \`\`\`${language}
    ${userCode}
    \`\`\`
    
    YOUR TASK:
    Analyze the problem definition and the user's code. Generate 2 to 3 extreme edge cases that might expose bugs in their logic (e.g. empty lists, huge numbers, negative boundaries, null cases, duplicates).
    
    Provide the output strictly as a JSON array of objects.
    Each object in the array must contain:
    - "input": String representation of the input. If there are multiple arguments, separate them with a newline.
    - "expected": String representation of the expected correct output.
    - "description": A short explanation of what scenario this edge case represents.
    
    JSON format template:
    [
      { "input": "input_string", "expected": "expected_string", "description": "scenario description" }
    ]
  `;

  try {
    const rawResult = await callGeminiAPI(prompt, true);
    return JSON.parse(rawResult.trim());
  } catch (error) {
    console.error('[GEMINI Edge-Case Error]', error);
    return getMockEdgeCases(problemTitle);
  }
};
