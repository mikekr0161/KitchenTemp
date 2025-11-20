import assert from 'assert';
import { calculateWasteCost, completionRate } from '../utils/metrics';

const wasteTotal = calculateWasteCost([
  { estimated_cost: 10 },
  { estimated_cost: 5.5 },
]);
assert.strictEqual(wasteTotal, 15.5, 'Waste total should add costs');

const rate = completionRate([
  { status: 'COMPLETED' },
  { status: 'IN_PROGRESS' },
  { status: 'COMPLETED' },
]);
assert.strictEqual(rate, 2 / 3, 'Completion rate should reflect completed runs');

console.log('All metric tests passed');
