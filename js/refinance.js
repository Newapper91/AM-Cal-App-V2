/**
 * refinance.js
 * -------------
 * Two related "is this worth it" calculators:
 *
 *  1. Refinance comparison: compare your CURRENT remaining loan to a
 *     hypothetical NEW loan (new rate/term/closing costs) and find the
 *     break-even point.
 *
 *  2. Buying points: compare your loan's rate WITHOUT points to the same
 *     loan WITH a lower rate bought via discount points, and find the
 *     break-even point.
 *
 * Both use the same core idea: divide the up-front cost by the monthly
 * savings to get "months to break even".
 */

const Refinance = {

  /**
   * @param {Object} p
   * @param {number} p.originalLoanAmount  the loan amount when you ORIGINALLY took out the loan
   * @param {number} p.originalTermYears   the term you ORIGINALLY chose (e.g. 30)
   * @param {number} p.currentRatePct      rate on the CURRENT loan
   * @param {number} p.currentBalance      remaining balance TODAY (what you'd actually refinance)
   * @param {number} p.currentRemainingMonths  months left on the current loan TODAY
   * @param {number} p.newRatePct          rate on the NEW loan
   * @param {number} p.newTermYears        term of the NEW loan (restarts amortization)
   * @param {number} p.refinanceCosts      closing costs for the new loan ($)
   * @param {Object} [p.extras]            if provided, run full amortization schedules
   *        (starting today) for BOTH the current loan and the new loan using
   *        these extra-payment settings, instead of the simple fixed-payment
   *        formula. Shape:
   *        { startDate: Date, extraMonthly, oneTimeExtras: [{amount,date}],
   *          annualExtra: {amount, month}, extraStartDate: Date|null }
   */
  compare(p) {
    // Your current monthly payment is FIXED by the loan you originally took
    // out — it does not change just because the remaining balance has gone
    // down over time. Recomputing it from currentBalance/remaining term
    // would silently "recast" the loan, which isn't what actually happens.
    const currentPayment = Calc.monthlyPI(p.originalLoanAmount, p.currentRatePct, p.originalTermYears);

    // The new loan refinances whatever balance remains TODAY.
    const newPayment = Calc.monthlyPI(p.currentBalance, p.newRatePct, p.newTermYears);

    const monthlySavings = currentPayment - newPayment;
    const breakEvenMonths = monthlySavings > 0 ? p.refinanceCosts / monthlySavings : null;

    let totalInterestCurrent;
    let totalInterestNew;
    const usingExtras = !!(p.extras && p.extras.startDate);

    if (usingExtras) {
      // Build full schedules for "keep current loan, starting today" and 
      // "refinance, starting today", both with the same extra payment plan.
      // Whichever payoff comes first (likely sooner with extras applied)
      // determines the actual total interest paid.
      const extraParams = {
        extraMonthly: p.extras.extraMonthly || 0,
        oneTimeExtras: p.extras.oneTimeExtras || [],
        annualExtra: p.extras.annualExtra || { amount: 0, month: null },
        extraStartDate: p.extras.extraStartDate || null,
      };

      // Current loan schedule: start from *remaining* balance, not original amount
      const currentSchedule = Amortization.generateSchedule({
        loanAmount: p.currentBalance,
        annualRatePct: p.currentRatePct,
        termYears: p.currentRemainingMonths / 12,
        startDate: p.extras.startDate,
        purchasePrice: p.currentBalance,
        ...extraParams,
      });

      const newSchedule = Amortization.generateSchedule({
        loanAmount: p.currentBalance,
        annualRatePct: p.newRatePct,
        termYears: p.newTermYears,
        startDate: p.extras.startDate,
        purchasePrice: p.currentBalance,
        ...extraParams,
      });

      totalInterestCurrent = currentSchedule.length 
        ? currentSchedule[currentSchedule.length - 1].cumulativeInterest : 0;
      totalInterestNew = newSchedule.length
        ? newSchedule[newSchedule.length - 1].cumulativeInterest : 0;
    } else {
      // Simple formula: assume only the scheduled (fixed) payment, no extras.
      // Total interest if you KEEP the current loan for its remaining term
      totalInterestCurrent = (currentPayment * p.currentRemainingMonths) - p.currentBalance;
      // Total interest on the NEW loan over its full term
      totalInterestNew = (newPayment * p.newTermYears * 12) - p.currentBalance;
    }

    const lifetimeInterestDifference = totalInterestCurrent - totalInterestNew;

    return {
      currentPayment,
      newPayment,
      monthlySavings,
      totalInterestCurrent,
      totalInterestNew,
      lifetimeInterestDifference,
      lifetimeInterestDifference_abs: Math.abs(lifetimeInterestDifference),
      keepCurrentLoanSaves: lifetimeInterestDifference < 0,
      breakEvenMonths,
      breakEvenYears: breakEvenMonths !== null ? breakEvenMonths / 12 : null,
      usingExtras,
    };
  },

  /**
   * Buying discount points break-even.
   * 1 "point" = 1% of the loan amount, paid up front, in exchange for a
   * lower interest rate.
   *
   * @param {Object} p
   * @param {number} p.loanAmount
   * @param {number} p.termYears
   * @param {number} p.originalRatePct   rate WITHOUT points
   * @param {number} p.discountedRatePct rate WITH points (lower)
   * @param {number} p.points            number of points purchased (e.g. 1.5)
   */
  pointsBreakEven(p) {
    const cost = p.loanAmount * (p.points / 100);
    const originalPayment = Calc.monthlyPI(p.loanAmount, p.originalRatePct, p.termYears);
    const discountedPayment = Calc.monthlyPI(p.loanAmount, p.discountedRatePct, p.termYears);
    const monthlySavings = originalPayment - discountedPayment;
    const breakEvenMonths = monthlySavings > 0 ? cost / monthlySavings : null;

    return {
      cost,
      originalPayment,
      discountedPayment,
      monthlySavings,
      breakEvenMonths,
      breakEvenYears: breakEvenMonths !== null ? breakEvenMonths / 12 : null,
    };
  },
};

window.Refinance = Refinance;
