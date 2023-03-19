import fs from 'fs';
import { parseOperations, calculateCommisions } from '../index.js';
import {
  calcCashInFee,
  calcNaturalCashOutFee,
  calcJuridicalCashOutFee,
} from '../commision.js';

test('parse operations', () => {
  const input = fs.readFileSync('src/tests/mock.json');
  const mappedInput = [
    {
      date: '2016-01-05',
      userId: 1,
      userType: 'natural',
      type: 'cash_in',
      operation: { amount: 200.0, currency: 'EUR' },
      operationId: 1,
    },
  ];
  expect(parseOperations(input)).toEqual(mappedInput);
  expect(parseOperations(``)).toEqual([]);
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

test('get cash out juridical commision fee', () => {
  const commision = { min: { amount: 0.5 }, percents: 0.3 };
  expect(calcJuridicalCashOutFee(200, commision)).toBe(0.6);
  expect(calcJuridicalCashOutFee(100, commision)).toBe(0.5);
  expect(calcJuridicalCashOutFee(1, commision)).toBe(0.5);
  expect(calcJuridicalCashOutFee(10000000, commision)).toBe(30000);
});

test('calculate commisions', () => {
  const input = fs.readFileSync('src/mockData.json');
  const operations = parseOperations(input);
  expect(calculateCommisions(operations)).toEqual([
    0.06, 0.9, 87, 3, 0.3, 0.3, 5, 0, 0,
  ]);
});

test('calculate commisions, round fee', () => {
  expect(
    calculateCommisions([
      {
        date: '2016-01-05',
        userId: 1,
        userType: 'juridical',
        type: 'cash_out',
        operation: { amount: 215, currency: 'EUR' },
        operationId: 1,
      },
    ])
  ).toEqual([0.65]);
});

test('calculate commisions, when two transactions has the same date and amount', () => {
  expect(
    calculateCommisions([
      {
        date: '2016-01-05',
        userId: 1,
        userType: 'natural',
        type: 'cash_out',
        operation: { amount: 1000, currency: 'EUR' },
        operationId: 1,
      },
      {
        date: '2016-01-05',
        userId: 1,
        userType: 'natural',
        type: 'cash_out',
        operation: { amount: 1000, currency: 'EUR' },
        operationId: 2,
      },
    ])
  ).toEqual([0, 3]);
});
