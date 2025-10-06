# class ChainedCounter

this class extends `ModCounter` and takes one or more `ModCounter` instances as rest parameters in its constructor.

### Constructor

```javascript
constructor(...modCounters)
```

The constructor accepts:
- One or more `ModCounter` instances as rest parameters (can be passed as separate arguments or spread from an array)
- Throws an error if no counters are provided
- Throws an error if any argument is not a ModCounter instance

### Behavior

it then subscribes to all counters, so that a reset event on counter i, increases counter (i+1), where 0 <= i < `modCounters.length - 1`.

on the reset event of the last counter, it raises its own reset event.

### getCurrent() Method

the `getCurrent()` method returns an **iterator** (generator function) that yields the current values from all chained counters.

To get an array of values, you can use:
```javascript
const values = [...chained.getCurrent()];
```

### Example Usage

```javascript
const d1 = new ModCounter(2); // range [0, 2)
const d2 = new ModCounter(5); // range [0, 5)
const chained = new ChainedCounter(d1, d2);
console.log([...chained.getCurrent()]); // [0, 0]
chained.increase();
console.log([...chained.getCurrent()]); // [1, 0]
chained.increase();
console.log([...chained.getCurrent()]); // [0, 1]
chained.increase();
console.log([...chained.getCurrent()]); // [1, 1]
chained.increase();
console.log([...chained.getCurrent()]); // [0, 2]
chained.increase();
console.log([...chained.getCurrent()]); // [1, 2]
chained.increase();
console.log([...chained.getCurrent()]); // [0, 3]
chained.increase();
console.log([...chained.getCurrent()]); // [1, 3]
chained.increase();
console.log([...chained.getCurrent()]); // [0, 4]
chained.increase();
console.log([...chained.getCurrent()]); // [1, 4]
chained.increase();
console.log([...chained.getCurrent()]); // [0, 0]

```
