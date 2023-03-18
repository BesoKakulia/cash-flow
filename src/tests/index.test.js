import fs from 'fs';
import { getOperations, calcCashInFee, calcNaturalCashOutFee } from '../index';

test('get operations', () => {
  const input = fs.readFileSync('src/tests/mock.json');
  const mappedInput = [
    {
      date: '2016-01-05',
      userId: 1,
      userType: 'natural',
      type: 'cash_in',
      operation: { amount: 200.0, currency: 'EUR' },
    },
  ];
  expect(getOperations(input)).toEqual(mappedInput);
  expect(getOperations(``)).toEqual([]);
});

test('get cash in commision fee', () => {
  const commision = { max: 5, percents: 0.03 };
  expect(calcCashInFee(200, commision)).toBe(0.06);
  expect(calcCashInFee(1000000, commision)).toBe(5);
  expect(calcCashInFee(30, commision)).toBe(0.009);
  expect(calcCashInFee(100, { max: 10, percents: 0.2 })).toBe(0.2);
});

test('get cash out nautral commision fee', () => {
  expect(calcNaturalCashOutFee(200, { weekAmount: 1000, percents: 0.3 })).toBe(
    0.6
  );
  expect(calcNaturalCashOutFee(400, { weekAmount: 230, percents: 0.3 })).toBe(
    0
  );
  expect(calcNaturalCashOutFee(3000, { weekAmount: 2000, percents: 0.3 })).toBe(
    9
  );
});
