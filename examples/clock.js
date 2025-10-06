const { ModCounter, ChainedCounter } = require('../src/index');

// Example: Clock using ChainedCounter
console.log('Example: Clock Simulation');
console.log('==========================');

// Create counters for hours, minutes, and seconds
const hoursCounter = new ModCounter(24);
const minutesCounter = new ModCounter(60);
const secondsCounter = new ModCounter(60);

// Chain the counters together
const clock = new ChainedCounter(secondsCounter, minutesCounter, hoursCounter);

// Simulate the clock for 100,000 seconds
const totalSeconds = 100000;

const printer = new ModCounter(3600)
  .subscribeOnReset(() => {
    const [seconds, minutes, hours] = [...clock.getCurrent()];
    const fmt = (n) => n.toString().padStart(2, '0')
    console.log(`Time: ${fmt(hours)}:${fmt(minutes)}:${fmt(seconds)}`);
  })

for (let i = 0; i < totalSeconds; i++, printer.increase()) {
  clock.increase();
}

console.log('Clock simulation complete!');
