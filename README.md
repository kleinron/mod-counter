# mod-counter

[![npm version](https://img.shields.io/npm/v/mod-counter.svg)](https://www.npmjs.com/package/mod-counter)
[![CI](https://github.com/kleinron/mod-counter/workflows/CI/badge.svg)](https://github.com/kleinron/mod-counter/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A JavaScript data structure library for modular (cyclic) counters with event-driven architecture. Perfect for creating clocks, generating combinations, and managing cyclical sequences.

## Features

- **ModCounter**: Cyclic counter that wraps around at boundaries
- **ChainedCounter**: Chain multiple counters for multi-dimensional counting (e.g., clocks, combinatorics)
- **Iterator Support**: Built-in generator functions for efficient iteration
- **TypeScript-Ready**: JSDoc annotations for better IDE support
- **Well-Tested**: Comprehensive test suite

## Installation

```bash
npm install mod-counter
```

## Quick Start

```javascript
const { ModCounter, ChainedCounter } = require('mod-counter');

// Simple counter from 0 to 9
const counter = new ModCounter(10);
console.log(counter.getCurrent()); // 0
counter.increase();
console.log(counter.getCurrent()); // 1
```

## API Documentation

### ModCounter

A counter that cycles through a range `[lowerBound, upperBound)`. When the counter reaches the upper bound, it wraps back to the lower bound.

#### Constructor

```javascript
new ModCounter(upperBound, options)
```

**Parameters:**
- `upperBound` (number, required): The exclusive upper bound of the range
- `options` (object, optional):
  - `lowerBound` (number): The inclusive lower bound (default: 0)
  - `startValue` (number): Starting value (default: lowerBound)

**Throws:**
- Error if `upperBound` is not greater than `lowerBound`
- Error if `startValue` is outside the valid range

#### Methods

##### `getCurrent()`
Returns the current value of the counter.

```javascript
const counter = new ModCounter(5);
console.log(counter.getCurrent()); // 0
```

##### `increase()`
Increases the counter by one. Wraps to lower bound if upper bound is reached.

```javascript
const counter = new ModCounter(3);
counter.increase(); // 1
counter.increase(); // 2
counter.increase(); // wraps to 0
```

##### `subscribeOnReset(callback)`
Subscribe to reset events. Returns `this` for chaining.

```javascript
const counter = new ModCounter(3);
counter.subscribeOnReset((resetValue) => {
  console.log(`Counter reset to ${resetValue}`);
});
```

##### `unsubscribeOnReset(callback)`
Unsubscribe from reset events. Returns `this` for chaining.

##### `iterateUntilReset()`
Returns an iterator that yields values until a reset occurs.

```javascript
const counter = new ModCounter(12, { lowerBound: 5 });
for (let v of counter.iterateUntilReset()) {
  console.log(v); // 5, 6, 7, 8, 9, 10, 11
}
```

### ChainedCounter

A counter that chains multiple `ModCounter` instances together. When a counter resets, it triggers the next counter to increase (like carrying in arithmetic).

#### Constructor

```javascript
new ChainedCounter(...modCounters)
```

**Parameters:**
- `...modCounters` (ModCounter instances): One or more counters to chain

**Throws:**
- Error if no counters are provided
- Error if any argument is not a ModCounter instance

#### Methods

##### `getCurrent()`
Returns an iterator that yields current values from all chained counters.

```javascript
const d1 = new ModCounter(2);
const d2 = new ModCounter(5);
const chained = new ChainedCounter(d1, d2);
console.log([...chained.getCurrent()]); // [0, 0]
```

##### `increase()`
Increases the first counter in the chain. May trigger a cascade of increases.

```javascript
chained.increase();
console.log([...chained.getCurrent()]); // [1, 0]
chained.increase();
console.log([...chained.getCurrent()]); // [0, 1]
```

##### `subscribeOnReset(callback)` / `unsubscribeOnReset(callback)`
Inherited from ModCounter. Triggers when the last counter in the chain resets.

## Examples

### Basic Counter

```javascript
const { ModCounter } = require('mod-counter');

// Counter from 5 to 11 (inclusive)
const counter = new ModCounter(12, { lowerBound: 5 });

console.log(counter.getCurrent()); // 5
counter.increase();
console.log(counter.getCurrent()); // 6

// ... increase 5 more times ...
console.log(counter.getCurrent()); // 11
counter.increase(); // reset!
console.log(counter.getCurrent()); // 5
```

### Reset Events

```javascript
const { ModCounter } = require('mod-counter');

const counter = new ModCounter(7, { lowerBound: 2 });
counter.subscribeOnReset((resetValue) => {
  console.log(`Counter reset to: ${resetValue}`);
});

for (let i = 0; i < 10; i++) {
  counter.increase();
}
// Output: "Counter reset to: 2" (when it wraps from 6 to 2)
```

### Clock Simulation

```javascript
const { ModCounter, ChainedCounter } = require('mod-counter');

// Create counters for a 24-hour clock
const secondsCounter = new ModCounter(60);
const minutesCounter = new ModCounter(60);
const hoursCounter = new ModCounter(24);

// Chain them: seconds -> minutes -> hours
const clock = new ChainedCounter(secondsCounter, minutesCounter, hoursCounter);

// Print time every hour
const hourlyPrinter = new ModCounter(3600)
  .subscribeOnReset(() => {
    const [seconds, minutes, hours] = [...clock.getCurrent()];
    console.log(`${hours}:${minutes}:${seconds}`);
  });

// Simulate 100,000 seconds
for (let i = 0; i < 100000; i++) {
  clock.increase();
  hourlyPrinter.increase();
}
```

### Powerset Generation

```javascript
const { ModCounter, ChainedCounter } = require('mod-counter');

function* generatePowerset(arr) {
  // Create a binary counter for each element
  const counters = arr.map(() => new ModCounter(2));
  const chained = new ChainedCounter(...counters);

  // Iterate through all combinations
  for (const combinationIterator of chained.iterateUntilReset()) {
    const bits = [...combinationIterator];
    const subset = arr.filter((_, i) => bits[i] === 1);
    yield subset;
  }
}

const inputSet = [1, 2, 3];
for (const subset of generatePowerset(inputSet)) {
  console.log(subset);
}
// Output: [], [1], [2], [1,2], [3], [1,3], [2,3], [1,2,3]
```

## Testing

Run the test suite:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

## Specification Files

Detailed specifications are available in the `/specs` directory:
- [Main Specification](specs/main.md) - Core ModCounter API
- [ChainedCounter Specification](specs/chained-counter.md) - ChainedCounter details

## License

MIT © Ron Klein

## Repository

[https://github.com/kleinron/mod-counter](https://github.com/kleinron/mod-counter)

## Issues

Report issues at: [https://github.com/kleinron/mod-counter/issues](https://github.com/kleinron/mod-counter/issues)

