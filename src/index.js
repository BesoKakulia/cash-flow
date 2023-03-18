import fs from 'fs';
import { calculateCommision } from './commision';

export function getOperations(input) {
  try {
    const parsedInput = JSON.parse(input);
    const mappedInput = parsedInput.map(
      ({ date, user_id, user_type, type, operation }) => ({
        date,
        userId: user_id,
        userType: user_type,
        type,
        operation,
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

export function calculateCommissions(operations) {
  const usersOperations = groupOperationsByUser(operations);

  operations.forEach((operation) => {
    const userOperations = usersOperations[operation.userId];
    console.log(calculateCommision(operation, userOperations));
  });
}

console.log(
  calculateCommissions(getOperations(fs.readFileSync('src/mockData.json')))
);
