const EventManager = require('../src/EventManager');

describe('EventManager', () => {
  let eventManager;

  beforeEach(() => {
    eventManager = new EventManager();
  });

  describe('constructor', () => {
    test('should create an empty event manager', () => {
      expect(eventManager.getSubscriberCount()).toBe(0);
    });
  });

  describe('subscribe()', () => {
    test('should add a callback to subscribers', () => {
      const callback = jest.fn();
      eventManager.subscribe(callback);
      expect(eventManager.getSubscriberCount()).toBe(1);
    });

    test('should add multiple callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      eventManager.subscribe(callback1);
      eventManager.subscribe(callback2);
      eventManager.subscribe(callback3);

      expect(eventManager.getSubscriberCount()).toBe(3);
    });

    test('should not add duplicate callbacks', () => {
      const callback = jest.fn();
      eventManager.subscribe(callback);
      eventManager.subscribe(callback);
      eventManager.subscribe(callback);

      expect(eventManager.getSubscriberCount()).toBe(1);
    });

    test('should throw TypeError if callback is not a function', () => {
      expect(() => eventManager.subscribe('not a function')).toThrow(TypeError);
      expect(() => eventManager.subscribe(123)).toThrow(TypeError);
      expect(() => eventManager.subscribe(null)).toThrow(TypeError);
      expect(() => eventManager.subscribe(undefined)).toThrow(TypeError);
    });
  });

  describe('unsubscribe()', () => {
    test('should remove a subscribed callback', () => {
      const callback = jest.fn();
      eventManager.subscribe(callback);
      expect(eventManager.getSubscriberCount()).toBe(1);

      eventManager.unsubscribe(callback);
      expect(eventManager.getSubscriberCount()).toBe(0);
    });

    test('should only remove the specified callback', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      eventManager.subscribe(callback1);
      eventManager.subscribe(callback2);
      eventManager.subscribe(callback3);

      eventManager.unsubscribe(callback2);

      expect(eventManager.getSubscriberCount()).toBe(2);
    });

    test('should do nothing if callback was not subscribed', () => {
      const callback = jest.fn();
      expect(() => eventManager.unsubscribe(callback)).not.toThrow();
      expect(eventManager.getSubscriberCount()).toBe(0);
    });
  });

  describe('notify()', () => {
    test('should call all subscribed callbacks with data', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      eventManager.subscribe(callback1);
      eventManager.subscribe(callback2);
      eventManager.subscribe(callback3);

      const testData = { value: 42 };
      eventManager.notify(testData);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback1).toHaveBeenCalledWith(testData);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledWith(testData);
      expect(callback3).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledWith(testData);
    });

    test('should work with different data types', () => {
      const callback = jest.fn();
      eventManager.subscribe(callback);

      // Number
      eventManager.notify(42);
      expect(callback).toHaveBeenLastCalledWith(42);

      // String
      eventManager.notify('hello');
      expect(callback).toHaveBeenLastCalledWith('hello');

      // Object
      const obj = { key: 'value' };
      eventManager.notify(obj);
      expect(callback).toHaveBeenLastCalledWith(obj);

      // Array
      const arr = [1, 2, 3];
      eventManager.notify(arr);
      expect(callback).toHaveBeenLastCalledWith(arr);

      expect(callback).toHaveBeenCalledTimes(4);
    });

    test('should not call unsubscribed callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventManager.subscribe(callback1);
      eventManager.subscribe(callback2);
      eventManager.unsubscribe(callback1);

      eventManager.notify('test');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    test('should do nothing if no subscribers', () => {
      expect(() => eventManager.notify('test')).not.toThrow();
    });

    test('should handle callbacks with multiple parameters gracefully', () => {
      const callback = jest.fn((_a, _b, _c) => {});
      eventManager.subscribe(callback);

      eventManager.notify(10);

      expect(callback).toHaveBeenCalledWith(10);
    });
  });

  describe('getSubscriberCount()', () => {
    test('should return correct count', () => {
      expect(eventManager.getSubscriberCount()).toBe(0);

      eventManager.subscribe(jest.fn());
      expect(eventManager.getSubscriberCount()).toBe(1);

      eventManager.subscribe(jest.fn());
      expect(eventManager.getSubscriberCount()).toBe(2);

      eventManager.subscribe(jest.fn());
      expect(eventManager.getSubscriberCount()).toBe(3);
    });
  });

  describe('clear()', () => {
    test('should remove all subscribers', () => {
      eventManager.subscribe(jest.fn());
      eventManager.subscribe(jest.fn());
      eventManager.subscribe(jest.fn());

      expect(eventManager.getSubscriberCount()).toBe(3);

      eventManager.clear();

      expect(eventManager.getSubscriberCount()).toBe(0);
    });

    test('should prevent cleared callbacks from being notified', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventManager.subscribe(callback1);
      eventManager.subscribe(callback2);

      eventManager.clear();
      eventManager.notify('test');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('generic callback signatures', () => {
    test('should work with no-parameter callbacks', () => {
      const callback = jest.fn();
      eventManager.subscribe(callback);
      eventManager.notify();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should work with callbacks expecting different signatures', () => {
      const singleParamCallback = jest.fn((value) => value * 2);
      const multiParamCallback = jest.fn((a, b) => a + b);
      const noParamCallback = jest.fn(() => 'hello');

      eventManager.subscribe(singleParamCallback);
      eventManager.subscribe(multiParamCallback);
      eventManager.subscribe(noParamCallback);

      eventManager.notify(5);

      expect(singleParamCallback).toHaveBeenCalledWith(5);
      expect(multiParamCallback).toHaveBeenCalledWith(5);
      expect(noParamCallback).toHaveBeenCalledWith(5);
    });
  });
});

