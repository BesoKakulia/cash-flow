import fs from 'fs';
import { calculateCommision } from './commision.js';

export function parseOperations(input) {
  try {
    const parsedInput = JSON.parse(input);
    const mappedInput = parsedInput.map(
      ({ date, user_id, user_type, type, operation }, index) => ({
        date,
        userId: user_id,
        userType: user_type,
        type,
        operation,
        // Use as identifier to calculate week limit corectly,
        // as for transactions that has the same amount cash out and the date, it is impossible
        // to figure out is it the same transaction or not.
        // to solve it we need more specific timestamp or operation id, or any other indentifier.
        operationId: index + 1,
      })
    );

    return mappedInput;
  } catch {
    return [];
  }
}

function groupOperationsByUser(operations) {
  return operations.reduce((result, operation) => {
    const { userId } = operation;
    if (result[userId]) {
      result[userId] = [...result[userId], operation];
      return result;
    } else {
      result[userId] = [operation];
      return result;
    }
  }, {});
}

function roundCommision(fee) {
  return Math.ceil(fee * 100) / 100;
}

export function calculateCommisions(operations) {
  const usersOperations = groupOperationsByUser(operations);

  const commisions = operations.map((operation) => {
    const userOperations = usersOperations[operation.userId];
    const commision = calculateCommision(operation, userOperations);
    return roundCommision(commision);
  });
  return commisions;
}

function logCommissions(file) {
  let fileData = null;
  try {
    fileData = fs.readFileSync(file);
  } catch {
    throw 'Invalid filepath provided';
  }

  const commisions = calculateCommisions(parseOperations(fileData));

  commisions.forEach((commision) => {
    console.log(commision.toFixed(2));
  });
}

const filePath = process.argv[2] || 'src/mockData.json';

logCommissions(filePath);
