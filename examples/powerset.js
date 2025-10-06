const { ModCounter, ChainedCounter } = require('../src/index');

/**
 * Generates the powerset of a given array using ChainedCounter
 * This is a generator function that yields each subset lazily
 *
 * Approach: "Generate all n-bit binary patterns, then select elements where bit = 1"
 * Focus: Index manipulation and pattern generation
 *
 * @param {Array} arr - The input array (must be non-empty)
 * @yields {Array} Each subset of the powerset
 */
function* generatePowerset(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('Input must be a non-empty array');
  }

  // Create a binary counter for each element (0 = exclude, 1 = include)
  const counters = arr.map(() => new ModCounter(2));

  // Chain all counters together
  const chained = new ChainedCounter(...counters);

  // Pre-allocate draft array for bits (reused across all iterations)
  const bits = new Array(arr.length);

  // Yield each combination as it's generated
  for (const combinationIterator of chained.iterateUntilReset()) {
    // Populate bits array from iterator
    combinationIterator.forEach((bit, i) => {bits[i] = bit;});

    // First iteration: Calculate subset size (sum the bits: 0s and 1s)
    const subsetSize = bits.reduce((count, bit) => count + bit, 0);

    // Second iteration: Populate subset with known size
    const subset = new Array(subsetSize);
    bits.map((bit, bitIndex) => ({bit, bitIndex}))
      .filter(p => p.bit === 1)
      .forEach((p, iterationIndex) => {
        subset[iterationIndex] = arr[p.bitIndex];
      });

    yield subset;
  }
}

console.log('=====================================');
const inputSet = [1, 2, 3];
console.log(`Input: ${JSON.stringify(inputSet)}`);
generatePowerset(inputSet).forEach((subset, i) => {
  console.log(`Subset #${(i+1)}: ${JSON.stringify(subset)}`);
});
