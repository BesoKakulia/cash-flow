import fs from 'fs';
import dayjs from 'dayjs';

dayjs.Ls.en.weekStart = 1;

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

function calcWeekCashOut(operation, userOperations) {
  const { date } = operation;

  // TODO bug when two transactions has the same day
  const operationsInCurrentWeek = userOperations.filter(
    (op) =>
      op.type === 'cash_out' &&
      dayjs(date).isSame(op.date, 'week') &&
      dayjs(date).isAfter(op.date)
  );

  console.log(dayjs(date).isSame('2016-01-07', 'week'));
  const prevTransSum = operationsInCurrentWeek.reduce(
    (sum, op) => (sum += op.operation.amount),
    0
  );

  return prevTransSum;
}

export function calcNaturalCashOutFee(currAmount, commision) {
  const { percents, weekAmount } = commision;

  const cashOutSum = weekAmount + currAmount;

  if (cashOutSum <= 1000) {
    return 0;
  }

  if (weekAmount >= 1000) {
    return (currAmount * percents) / 100;
  }

  return ((cashOutSum - 1000) * percents) / 100;
}

export function calcJuridicalCashOutFee(amount, commision) {
  return Math.max(commision.min.amount, (amount * commision.percents) / 100);
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
      max: feeConfig.cashIn.max.amount,
    };
    return calcCashInFee(amount, commision);
  }

  if (type === 'cash_out' && userType === 'natural') {
    const commision = {
      percents: feeConfig.cashOut.natural.percents,
      /** Not clear how the commision is calculated
       * Is it calculated from sum of all exceeded money
       * or from each transaction separately after the limit exceeded?
       * example:
       * if a user cash outs 1 000 000 the transation is 0.3 percent of 1 000 000
       * then if the same user cash outs 100 in the same week,
       * is commision 0.3 percent of 1 000 100 or 0.3 of 100
       */
      weekAmount: calcWeekCashOut(operation, userOperations),
    };
    return calcNaturalCashOutFee(amount, commision);
  }

  if (type === 'cash_out' && userType === 'juridical') {
    const commision = feeConfig.cashOut.juridical;
    return calcJuridicalCashOutFee(amount, commision);
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
  const operation = operations[5];
  const userOperations = usersOperations[operation.userId];

  return calculateCommision(operation, userOperations);

  // operations.forEach((operation) => {
  //   const userOperations = usersOperations[operation.userId];
  //   console.log(calculateCommision(operation, userOperations));
  // });
}

console.log(
  calculateCommissions(getOperations(fs.readFileSync('src/mockData.json')))
);
