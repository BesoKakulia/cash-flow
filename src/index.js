import fs from 'fs';

const feeConfig = {
  cashIn: {
    percents: 0.03,
    max: { amount: 5 },
  },
  cashOut: {
    natural: {
      percents: 0.3,
      weekLimit: {
        amount: 1000,
        currency: 'EUR',
      },
    },
    juridical: {
      percents: 0.3,
      min: {
        amount: 0.5,
        currency: 'EUR',
      },
    },
  },
};

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

export function calcCashInFee(amount, commision) {
  return Math.min(commision.max, (amount * commision.percents) / 100);
}

function calcExeedAmount(operations, operation) {
  const { userId, amount, date } = operation;

  const userOperations = operations.filter((op) => {
    return (
      op.type === 'cash_out' &&
      op.userType === 'natural' &&
      userId === operation.userId
    );
  });
}

export function calcNaturalCashOutFee(commision) {
  const { percents, exceedAmount } = commision;

  return (exceedAmount * percents) / 100;
}

export function calculateCommision(operation, userOperations) {
  const {
    type,
    operation: { amount },
    userType,
  } = operation;

  if (type === 'cash_in') {
    const commision = {
      percents: feeConfig.cashIn.percents,
      max: feeConfig.cashIn.percents.max,
    };
    return calcCashInFee(amount, commision);
  }

  if (type === 'cash_out' && userType === 'natural') {
    const commision = {
      percents: feeConfig.cashIn.percents,
      exceed: calcExeedAmount(operation, userOperations),
    };
    return calcNaturalCashOutFee(amount, commision);
  }
}

export function calculateCommissions(operations) {
  const usersOperations = operations.reduce((result, operation) => {
    const { userId } = operation;
    if (result[userId]) {
      result[userId] = [...result[userId], operation];
      return result;
    } else {
      result[userId] = [operation];
      return result;
    }
  }, {});

  oprations.forEach((operation) => {
    const userOperations = usersOperations[operation.userId];
    console.log(calculateCommision(operation, userOperations));
  });
}

console.log(
  calculateCommissions(getOperations(fs.readFileSync('src/mockData.json')))
);
