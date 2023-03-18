import fs from 'fs';
import { getOperations } from '../index';

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
