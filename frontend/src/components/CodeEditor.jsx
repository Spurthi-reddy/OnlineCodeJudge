import React, { useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Play, Send, RefreshCw, Layers } from 'lucide-react';

const LANGUAGE_TEMPLATES = {
  javascript: {
    'Two Sum': `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your code here
    
}`,
    'Palindrome Number': `/**
 * @param {number} x
 * @return {boolean}
 */
function isPalindrome(x) {
    // Write your code here
    
}`,
    'Default': `function solve() {
    // Write your code here
    
}`
  },
  python: {
    'Two Sum': `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your code here
        pass`,
    'Palindrome Number': `class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Write your code here
        pass`,
    'Default': `def solve():
    # Write your code here
    pass`
  },
  cpp: {
    'Two Sum': `#include <vector>
#include <iostream>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        
    }
};`,
    'Palindrome Number': `#include <iostream>
using namespace std;

class Solution {
public:
    bool isPalindrome(int x) {
        // Write your code here
        
    }
};`,
    'Default': `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`
  }
};

const CodeEditor = ({ 
  code, 
  setCode, 
  language, 
  setLanguage, 
  problemTitle, 
  onRun, 
  onSubmit, 
  isRunning, 
  isSubmitting 
}) => {

  const getTemplate = (lang, title) => {
    const templates = LANGUAGE_TEMPLATES[lang] || LANGUAGE_TEMPLATES.javascript;
    return templates[title] || templates['Default'];
  };

  // Reset editor template when language or problem title changes
  useEffect(() => {
    setCode(getTemplate(language, problemTitle));
  }, [language, problemTitle]);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your code to the default template?')) {
      setCode(getTemplate(language, problemTitle));
    }
  };

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: 'JetBrains Mono, Fira Code, monospace',
    lineHeight: 22,
    automaticLayout: true,
    padding: { top: 12 },
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
    lineNumbersMinChars: 3,
  };

  return (
    <div class="flex h-full flex-col bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
      
      {/* Editor Controls Header */}
      <div class="flex h-12 items-center justify-between bg-dark-950 px-4 border-b border-dark-800">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 rounded-lg bg-dark-900 px-2 py-1 text-xs border border-dark-800">
            <Layers class="h-3.5 w-3.5 text-brand-400" />
            <span class="font-semibold text-slate-300">Editor</span>
          </div>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            class="rounded-lg bg-dark-900 px-3 py-1 text-xs font-medium text-slate-300 border border-dark-800 hover:border-slate-700 outline-none cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        {/* Action buttons */}
        <div class="flex items-center gap-2">
          {/* Reset template */}
          <button
            onClick={handleReset}
            class="flex items-center justify-center rounded-lg border border-dark-800 p-1.5 text-slate-400 hover:bg-dark-800 hover:text-white transition-colors"
            title="Reset to default template"
          >
            <RefreshCw class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Monaco Editor Pane */}
      <div class="flex-grow min-h-0 relative">
        <MonacoEditor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          options={editorOptions}
          loading={
            <div class="absolute inset-0 flex items-center justify-center bg-dark-900 text-sm text-slate-500">
              Initializing Code Sandbox...
            </div>
          }
        />
      </div>

      {/* Editor Footer execution trigger actions */}
      <div class="flex h-14 items-center justify-end bg-dark-950 px-4 border-t border-dark-800 gap-3">
        <button
          onClick={onRun}
          disabled={isRunning || isSubmitting}
          class="flex items-center gap-1.5 rounded-lg border border-dark-800 bg-dark-900 hover:bg-dark-800 px-4 py-1.5 text-xs font-semibold text-slate-300 transition-colors disabled:opacity-50"
        >
          <Play class={`h-3.5 w-3.5 text-emerald-400 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
        
        <button
          onClick={onSubmit}
          disabled={isRunning || isSubmitting}
          class="flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white px-5 py-1.5 text-xs font-bold shadow-md shadow-brand-600/10 hover:shadow-brand-500/20 hover:scale-102 transition-all disabled:opacity-50"
        >
          <Send class="h-3.5 w-3.5" />
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

    </div>
  );
};

export default CodeEditor;
