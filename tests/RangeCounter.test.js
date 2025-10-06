const { ModCounter } = require('../src/index');

describe('ModCounter', () => {
  describe('constructor', () => {
    test('should create a counter with valid range [5, 12)', () => {
      const counter = new ModCounter(12, { lowerBound: 5 });
      expect(counter).toBeDefined();
    });

    test('should accept optional starting value', () => {
      const counter = new ModCounter(12, { lowerBound: 5, startValue: 7 });
      expect(counter.getCurrent()).toBe(7);
    });
  });

  describe('getCurrent()', () => {
    test('should return initial value (lower bound by default)', () => {
      const counter = new ModCounter(12, { lowerBound: 5 });
      expect(counter.getCurrent()).toBe(5);
    });

    test('should return current value after increases', () => {
      const counter = new ModCounter(12, { lowerBound: 5 });
      counter.increase();
      expect(counter.getCurrent()).toBe(6);
    });
  });

  describe('increase()', () => {
    test('should increment counter by 1', () => {
      const counter = new ModCounter(12, { lowerBound: 5 });
      expect(counter.getCurrent()).toBe(5);
      counter.increase();
      expect(counter.getCurrent()).toBe(6);
    });

    test('should wrap to lower bound when reaching upper bound', () => {
      const counter = new ModCounter(12, { lowerBound: 5 });
      // Increase from 5 to 11
      for (let i = 0; i < 7; i++) {
        counter.increase();
      }
      expect(counter.getCurrent()).toBe(5);
    });

    test('should handle negative ranges', () => {
      const counter = new ModCounter(2, { lowerBound: -3 });
      expect(counter.getCurrent()).toBe(-3);
      counter.increase();
      expect(counter.getCurrent()).toBe(-2);
    });
  });

  describe('subscribeOnReset() and unsubscribeOnReset()', () => {
    test('should call subscriber when counter resets', () => {
      const counter = new ModCounter(7, { lowerBound: 2 });
      const mockCallback = jest.fn();
      
      counter.subscribeOnReset(mockCallback);

      // Increase to trigger reset
      for (let i = 0; i < 5; i++) {
        counter.increase();
      }

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(2);
    });

    test('should support multiple subscribers', () => {
      const counter = new ModCounter(3);
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      counter.subscribeOnReset(callback1);
      counter.subscribeOnReset(callback2);

      // Increase to trigger reset
      for (let i = 0; i < 3; i++) {
        counter.increase();
      }

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    test('should not call unsubscribed callbacks', () => {
      const counter = new ModCounter(3);
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      counter.subscribeOnReset(callback1);
      counter.subscribeOnReset(callback2);
      counter.unsubscribeOnReset(callback1);

      // Increase to trigger reset
      for (let i = 0; i < 3; i++) {
        counter.increase();
      }

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    test('should not call subscribers when not resetting', () => {
      const counter = new ModCounter(10, { lowerBound: 5 });
      const mockCallback = jest.fn();
      
      counter.subscribeOnReset(mockCallback);

      // Increase without triggering reset
      for (let i = 0; i < 4; i++) {
        counter.increase();
      }

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    test('should handle range of size 1', () => {
      const counter = new ModCounter(6, { lowerBound: 5 });
      expect(counter.getCurrent()).toBe(5);
      counter.increase();
      expect(counter.getCurrent()).toBe(5); // wraps immediately
    });

    test('should handle large ranges', () => {
      const counter = new ModCounter(1000000);
      expect(counter.getCurrent()).toBe(0);
      counter.increase();
      expect(counter.getCurrent()).toBe(1);
    });
  });

  describe('iterateUntilReset()', () => {
    test('should return an iterator', () => {
      const counter = new ModCounter(3);
      const iterator = counter.iterateUntilReset();
      
      expect(iterator).toBeDefined();
    });

    test('should iterate through values until reset', () => {
      const counter = new ModCounter(4);
      const iterator = counter.iterateUntilReset();
      
      let result = iterator.next();
      expect(result.value).toBe(0);
      expect(result.done).toBe(false);

      result = iterator.next();
      expect(result.value).toBe(1);
      expect(result.done).toBe(false);

      result = iterator.next();
      expect(result.value).toBe(2);
      expect(result.done).toBe(false);

      result = iterator.next();
      expect(result.value).toBe(3);
      expect(result.done).toBe(false);

      result = iterator.next();
      expect(result.done).toBe(true);
    });

    test('should work with for...of loop', () => {
      const counter = new ModCounter(9, { lowerBound: 5 });
      const values = [];
      
      for (const value of counter.iterateUntilReset()) {
        values.push(value);
      }

      expect(values).toEqual([5, 6, 7, 8]);
    });

    test('should handle multiple iterations', () => {
      const counter = new ModCounter(3);
      
      // First iteration
      const values1 = [...counter.iterateUntilReset()];
      expect(values1).toEqual([0, 1, 2]);

      // Second iteration
      const values2 = [...counter.iterateUntilReset()];
      expect(values2).toEqual([0, 1, 2]);
    });

    test('should handle counter starting mid-range', () => {
      const counter = new ModCounter(5, { startValue: 2 }); // start at 2
      const values = [...counter.iterateUntilReset()];
      
      expect(values).toEqual([2, 3, 4]);
    });

    test('should handle range of size 1', () => {
      const counter = new ModCounter(8, { lowerBound: 7 });
      const values = [...counter.iterateUntilReset()];
      
      expect(values).toEqual([7]);
    });

    test('should handle negative ranges', () => {
      const counter = new ModCounter(2, { lowerBound: -2 });
      const values = [...counter.iterateUntilReset()];
      
      expect(values).toEqual([-2, -1, 0, 1]);
    });

    test('should stop immediately before reset on subsequent iterations', () => {
      const counter = new ModCounter(3);
      
      // Manually increase partway
      counter.increase(); // 0 -> 1

      // First iteration
      const values1 = [...counter.iterateUntilReset()];
      expect(values1).toEqual([1, 2]);

      // Second iteration
      const values2 = [...counter.iterateUntilReset()];
      expect(values2).toEqual([0, 1, 2]);
    });
  });
});

