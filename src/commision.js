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

  const prevTransSum = operationsInCurrentWeek.reduce(
    (sum, op) => (sum += op.operation.amount),
    0
  );

  return prevTransSum;
}

export function calcNaturalCashOutFee(currAmount, commision) {
  const { percents, weekAmount } = commision;

  const cashOutSum = weekAmount + currAmount;

  const weekLimit = feeConfig.cashOut.natural.weekLimit.amount;

  if (cashOutSum <= weekLimit) {
    return 0;
  }

  if (weekAmount >= weekLimit) {
    return (currAmount * percents) / 100;
  }

  return ((cashOutSum - weekLimit) * percents) / 100;
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
      weekAmount: calcWeekCashOut(operation, userOperations),
    };
    return calcNaturalCashOutFee(amount, commision);
  }

  if (type === 'cash_out' && userType === 'juridical') {
    const commision = feeConfig.cashOut.juridical;
    return calcJuridicalCashOutFee(amount, commision);
  }
}
