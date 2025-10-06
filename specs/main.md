# mod-counter

this project aims to have a generic modulos (cyclic) counter.

## Exported Classes

The library exports three main classes:
- `ModCounter` - A counter that cycles through a range
- `ChainedCounter` - Chains multiple ModCounters together
- `EventManager` - Generic event manager for subscriptions

## ModCounter

`ModCounter` is the main class that provides the following API:

method: `getCurrent()`
method: `increase()`

method: `subscribeOnReset(..)`
method: `unsubscribeOnReset(..)`

method: `iterateUntilReset()`

### Constructor

`ModCounter` takes an upper-bound (exclusive) integer number and an optional options object:
- `upperBound` (required) - The exclusive upper bound of the range
- `options.lowerBound` (optional) - The inclusive lower bound of the range (defaults to 0)
- `options.startValue` (optional) - Starting value (defaults to lowerBound)

The constructor creates a range [lowerBound, upperBound) where upperBound > lowerBound.

### Example Usage

for instance:
```javascript
const myCounter = new ModCounter(12, { lowerBound: 5 });
console.log(myCounter.getCurrent()); // 5
myCounter.increase(); 
console.log(myCounter.getCurrent()); // 6
myCounter.increase(); 
myCounter.increase(); 
myCounter.increase(); 
myCounter.increase(); 
myCounter.increase(); 
console.log(myCounter.getCurrent()); // 11
myCounter.increase(); // reset! 
console.log(myCounter.getCurrent()); // 5
```

the event related API can be used to capture the reset events, like so:
```javascript
const myCounter = new ModCounter(7, { lowerBound: 2 });
myCounter.subscribeOnReset((resetValue) => {
  console.log("counter was reset. current value is: " + resetValue);
});
console.log(myCounter.getCurrent()); // 2
myCounter.increase();
myCounter.increase();
myCounter.increase();
myCounter.increase(); // now 6
myCounter.increase(); // reset was triggered. console should display: counter was reset. current value is: 2

```

the method `iterateUntilReset` will return an iterator that will be considered "done" when a reset was triggered.
example:
```javascript
const myCounter = new ModCounter(12, { lowerBound: 5 });
for (let v of myCounter.iterateUntilReset()) {
  console.log(v);
}
// 5, 6, 7, 8, 9, 10, 11

```
