import { WordScrambler } from './wordScrambler.js';

function testValidation() {
  console.log('🧪 Testing Improved Answer Validation\n');
  
  const testCases = [
    // Exact matches (should always pass)
    {
      selected: ['The', 'lion', 'is', 'king'],
      target: 'The lion is king',
      expected: true,
      description: 'Exact match'
    },
    {
      selected: ['break', 'a', 'leg'],
      target: 'Break a leg',
      expected: true,
      description: 'Exact match with different case'
    },
    
    // Missing filler words (should pass)
    {
      selected: ['lion', 'king'],
      target: 'The lion is king',
      expected: true,
      description: 'Missing "the" and "is"'
    },
    {
      selected: ['break', 'leg'],
      target: 'Break a leg',
      expected: true,
      description: 'Missing "a"'
    },
    {
      selected: ['baby', 'shark', 'doo'],
      target: 'Baby shark doo',
      expected: true,
      description: 'No filler words to ignore'
    },
    
    // Mostly correct with some missing content words (should pass)
    {
      selected: ['lion', 'is', 'king'],
      target: 'The lion is the king',
      expected: true,
      description: 'Missing one "the"'
    },
    {
      selected: ['girl', 'fights'],
      target: 'A girl fights competition',
      expected: true,
      description: 'Missing "a" and "competition" (70% match)'
    },
    
    // Mostly correct with extra words (should pass)
    {
      selected: ['the', 'big', 'lion', 'is', 'king'],
      target: 'The lion is king',
      expected: true,
      description: 'Extra word "big" but all content words present'
    },
    
    // Incorrect answers (should fail)
    {
      selected: ['tiger', 'is', 'king'],
      target: 'The lion is king',
      expected: false,
      description: 'Wrong content word "tiger" instead of "lion"'
    },
    {
      selected: ['break', 'arm'],
      target: 'Break a leg',
      expected: false,
      description: 'Wrong content word "arm" instead of "leg"'
    },
    {
      selected: ['baby', 'whale'],
      target: 'Baby shark doo',
      expected: false,
      description: 'Only 1 of 2 content words correct'
    },
    {
      selected: ['the', 'is'],
      target: 'The lion is king',
      expected: false,
      description: 'Only filler words, no content words'
    },
    
    // Edge cases
    {
      selected: ['lion', 'king', 'jungle'],
      target: 'The lion is king',
      expected: true,
      description: 'Extra content word but all target content present'
    },
    {
      selected: ['a', 'the'],
      target: 'The a',
      expected: true,
      description: 'Only filler words, but target has only filler words'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const result = WordScrambler.validateAnswer(testCase.selected, testCase.target);
    const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
    
    if (result === testCase.expected) {
      passed++;
    } else {
      failed++;
    }
    
    console.log(`${status}: ${testCase.description}`);
    console.log(`   Selected: [${testCase.selected.join(', ')}]`);
    console.log(`   Target: "${testCase.target}"`);
    console.log(`   Expected: ${testCase.expected}, Got: ${result}`);
    console.log('');
  }
  
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All validation tests passed!');
  } else {
    console.log('⚠️  Some tests failed - check the validation logic');
  }
}

// Run the test
if (typeof window === 'undefined') {
  // Node.js environment
  testValidation();
} else {
  // Browser environment - export for manual testing
  window.testValidation = testValidation;
}