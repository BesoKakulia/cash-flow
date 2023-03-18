import fs from 'fs';

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
