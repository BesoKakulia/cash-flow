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

export function calculateCommision(operation) {
  const {
    type,
    operation: { amount },
  } = operation;

  if (type === 'cash_in') {
    const commision = {
      percents: feeConfig.cashIn.percents,
      max: feeConfig.cashIn.percents.max,
    };
    return calcCashInFee(amount, commision);
  }
}

export function calculateCommissions(oprations) {
  oprations.forEach((operation) => {
    console.log(calculateCommision(operation));
  });
}

console.log(getOperations(fs.readFileSync('src/mockData.json')));
