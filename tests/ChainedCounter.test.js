const { ChainedCounter, ModCounter } = require('../src/index');

describe('ChainedCounter', () => {
  describe('constructor', () => {
    test('should create a chained counter with valid ModCounters', () => {
      const c1 = new ModCounter(2);
      const c2 = new ModCounter(3);
      const chained = new ChainedCounter(c1, c2);
      expect(chained).toBeDefined();
    });

    test('should work with single counter', () => {
      const c1 = new ModCounter(3);
      const chained = new ChainedCounter(c1);
      expect([...chained.getCurrent()]).toEqual([0]);
    });
  });

  describe('getCurrent()', () => {
    test('should return iterator of current values from all counters', () => {
      const c1 = new ModCounter(8, { lowerBound: 5 });
      const c2 = new ModCounter(13, { lowerBound: 10 });
      const chained = new ChainedCounter(c1, c2);

      expect([...chained.getCurrent()]).toEqual([5, 10]);
    });

    test('should update as counters change', () => {
      const c1 = new ModCounter(2);
      const c2 = new ModCounter(2);
      const chained = new ChainedCounter(c1, c2);

      expect([...chained.getCurrent()]).toEqual([0, 0]);
      chained.increase();
      expect([...chained.getCurrent()]).toEqual([1, 0]);
      chained.increase();
      expect([...chained.getCurrent()]).toEqual([0, 1]);
    });

    test('should return an iterator', () => {
      const c1 = new ModCounter(3);
      const c2 = new ModCounter(3);
      const chained = new ChainedCounter(c1, c2);

      const iterator = chained.getCurrent();
      expect(typeof iterator.next).toBe('function');
    });

    test('should work with for...of loop', () => {
      const c1 = new ModCounter(4, { lowerBound: 1 });
      const c2 = new ModCounter(8, { lowerBound: 5 });
      const chained = new ChainedCounter(c1, c2);

      const values = [];
      for (const value of chained.getCurrent()) {
        values.push(value);
      }
      expect(values).toEqual([1, 5]);
    });
  });

  describe('increase() - chaining behavior', () => {
    test('should follow spec example exactly', () => {
      const d1 = new ModCounter(2);
      const d2 = new ModCounter(5);
      const chained = new ChainedCounter(d1, d2);

      expect([...chained.getCurrent()]).toEqual([0, 0]);
      chained.increase(); // [1, 0]
      chained.increase(); // [0, 1]
      chained.increase(); // [1, 1]
      chained.increase(); // [0, 2]
      chained.increase(); // [1, 2]
      chained.increase(); // [0, 3]
      chained.increase(); // [1, 3]
      chained.increase(); // [0, 4]
      chained.increase(); // [1, 4]
      chained.increase(); // [0, 0] - reset

      expect([...chained.getCurrent()]).toEqual([0, 0]);
    });

    test('should increment first counter on each increase', () => {
      const c1 = new ModCounter(5);
      const c2 = new ModCounter(3);
      const chained = new ChainedCounter(c1, c2);

      expect([...chained.getCurrent()]).toEqual([0, 0]);
      chained.increase();
      expect([...chained.getCurrent()]).toEqual([1, 0]);
      chained.increase();
      expect([...chained.getCurrent()]).toEqual([2, 0]);
    });

    test('should carry over when first counter resets', () => {
      const c1 = new ModCounter(3);
      const c2 = new ModCounter(4);
      const chained = new ChainedCounter(c1, c2);

      expect([...chained.getCurrent()]).toEqual([0, 0]);
      chained.increase(); // [1, 0]
      chained.increase(); // [2, 0]
      chained.increase(); // [0, 1] - c1 reset, c2 increased

      expect([...chained.getCurrent()]).toEqual([0, 1]);
    });

    test('should work with three counters', () => {
      const c1 = new ModCounter(2);
      const c2 = new ModCounter(2);
      const c3 = new ModCounter(2);
      const chained = new ChainedCounter(c1, c2, c3);

      expect([...chained.getCurrent()]).toEqual([0, 0, 0]);
      chained.increase();
      expect([...chained.getCurrent()]).toEqual([1, 0, 0]);
      chained.increase();
      expect([...chained.getCurrent()]).toEqual([0, 1, 0]);
    });

    test('should work with ModCounters', () => {
      const c1 = new ModCounter(2);
      const c2 = new ModCounter(3);
      const chained = new ChainedCounter(c1, c2);

      expect([...chained.getCurrent()]).toEqual([0, 0]);
      chained.increase();
      expect([...chained.getCurrent()]).toEqual([1, 0]);
      chained.increase();
      expect([...chained.getCurrent()]).toEqual([0, 1]);
    });
  });

  describe('subscribeOnReset() and unsubscribeOnReset()', () => {
    test('should trigger reset event when last counter resets', () => {
      const c1 = new ModCounter(2);
      const c2 = new ModCounter(3);
      const chained = new ChainedCounter(c1, c2);
      let value = [];
      const myCallback = (v => value.push(v));


      chained.subscribeOnReset(myCallback);

      // Cycle through: 2 * 3 = 6 combinations
      for (let i = 0; i < 5; i++) {
        chained.increase();
      }

      expect(value.length).toEqual(0);

      chained.increase(); // Should trigger reset

      expect(value.length).toBe(1);
      expect([...value[0]]).toEqual([0, 0]);
    });

    test('should pass reset value array to callback', () => {
      const c1 = new ModCounter(7, { lowerBound: 5 });
      const c2 = new ModCounter(12, { lowerBound: 10 });
      const chained = new ChainedCounter(c1, c2);
      const results = [];
      const myCallback = (result) => results.push(result);

      chained.subscribeOnReset(myCallback);


      for (let i = 0; i < 3 ; i++) {
        chained.increase();
      }
      expect(results.length).toEqual(0);
      chained.increase();

      expect([...results[0]]).toEqual([5, 10]);
    });

    test('should not trigger on intermediate resets', () => {
      const c1 = new ModCounter(2);
      const c2 = new ModCounter(3);
      const chained = new ChainedCounter(c1, c2);
      const mockCallback = jest.fn();

      chained.subscribeOnReset(mockCallback);

      chained.increase(); // [1, 0]
      chained.increase(); // [0, 1] - c1 resets but not last counter

      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('should support multiple subscribers', () => {
      const c1 = new ModCounter(2);
      const c2 = new ModCounter(2);
      const chained = new ChainedCounter(c1, c2);
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      chained.subscribeOnReset(callback1);
      chained.subscribeOnReset(callback2);

      // 2 * 2 = 4 combinations
      for (let i = 0; i < 4; i++) {
        chained.increase();
      }

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    test('should not call unsubscribed callbacks', () => {
      const c1 = new ModCounter(2);
      const c2 = new ModCounter(2);
      const chained = new ChainedCounter(c1, c2);
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      chained.subscribeOnReset(callback1);
      chained.subscribeOnReset(callback2);
      chained.unsubscribeOnReset(callback1);

      for (let i = 0; i < 4; i++) {
        chained.increase();
      }

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    test('should trigger reset with single counter', () => {
      const c1 = new ModCounter(3);
      const chained = new ChainedCounter(c1);
      const results = [];
      const myCallback = (result) => results.push(result);

      chained.subscribeOnReset(myCallback);

      chained.increase(); // [1]
      chained.increase(); // [2]
      chained.increase(); // [0] - reset

      expect(results.length).toEqual(1);
      expect([...results[0]]).toEqual([0]);
    });
  });

  describe('edge cases', () => {
    test('should handle counters with size 1', () => {
      const c1 = new ModCounter(6, { lowerBound: 5 }); // size 1
      const c2 = new ModCounter(3);
      const chained = new ChainedCounter(c1, c2);

      expect([...chained.getCurrent()]).toEqual([5, 0]);
      chained.increase();
      expect([...chained.getCurrent()]).toEqual([5, 1]);
      chained.increase();
      expect([...chained.getCurrent()]).toEqual([5, 2]);
      chained.increase();
      expect([...chained.getCurrent()]).toEqual([5, 0]);
    });

    test('should handle many counters', () => {
      const counters = [
        new ModCounter(2),
        new ModCounter(2),
        new ModCounter(2),
        new ModCounter(2),
        new ModCounter(2)
      ];
      const chained = new ChainedCounter(counters);

      expect([...chained.getCurrent()]).toEqual([0, 0, 0, 0, 0]);

      // Should have 2^5 = 32 total combinations
      for (let i = 0; i < 31; i++) {
        chained.increase();
      }

      expect([...chained.getCurrent()]).toEqual([1, 1, 1, 1, 1]);

      chained.increase();
      expect([...chained.getCurrent()]).toEqual([0, 0, 0, 0, 0]);
    });

    test('should calculate total combinations correctly', () => {
      const c1 = new ModCounter(3); // 3 values
      const c2 = new ModCounter(4); // 4 values
      const c3 = new ModCounter(2); // 2 values
      const chained = new ChainedCounter(c1, c2, c3);

      const mockCallback = jest.fn();
      chained.subscribeOnReset(mockCallback);

      // Total combinations: 3 * 4 * 2 = 24
      for (let i = 0; i < 24; i++) {
        chained.increase();
      }

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect([...chained.getCurrent()]).toEqual([0, 0, 0]);
    });
  });

  describe('iterateUntilReset()', () => {
    test('should iterate through all combinations', () => {
      const c1 = new ModCounter(2);
      const c2 = new ModCounter(3);
      const chained = new ChainedCounter(c1, c2);

      // Convert each iterator to array
      const values = [];
      for (const combination of chained.iterateUntilReset()) {
        values.push([...combination]);
      }

      // Should have 2 * 3 = 6 combinations
      expect(values).toEqual([
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
        [0, 2],
        [1, 2]
      ]);

      // Counter should have reset
      expect([...chained.getCurrent()]).toEqual([0, 0]);
    });

    test('should work with three counters', () => {
      const c1 = new ModCounter(2);
      const c2 = new ModCounter(2);
      const c3 = new ModCounter(2);
      const chained = new ChainedCounter(c1, c2, c3);

      const values = [];
      for (const combination of chained.iterateUntilReset()) {
        values.push([...combination]);
      }

      // Should have 2 * 2 * 2 = 8 combinations
      expect(values.length).toBe(8);
    });

    test('should work with ModCounter', () => {
      const c1 = new ModCounter(2);
      const c2 = new ModCounter(3);
      const chained = new ChainedCounter(c1, c2);

      const values = [];
      for (const combination of chained.iterateUntilReset()) {
        values.push([...combination]);
      }

      expect(values).toEqual([
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
        [0, 2],
        [1, 2]
      ]);
    });

    test('should work with single counter', () => {
      const c1 = new ModCounter(8, { lowerBound: 5 });
      const chained = new ChainedCounter(c1);

      const values = [];
      for (const combination of chained.iterateUntilReset()) {
        values.push([...combination]);
      }

      expect(values).toEqual([[5], [6], [7]]);
    });

    test('should support multiple iterations', () => {
      const c1 = new ModCounter(2);
      const c2 = new ModCounter(2);
      const chained = new ChainedCounter(c1, c2);

      const values1 = [];
      for (const combination of chained.iterateUntilReset()) {
        values1.push([...combination]);
      }
      expect(values1.length).toBe(4);

      const values2 = [];
      for (const combination of chained.iterateUntilReset()) {
        values2.push([...combination]);
      }
      expect(values2.length).toBe(4);
    });
  });
});

