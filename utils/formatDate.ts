interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface Week {
  contributionDays: ContributionDay[];
}

interface MonthOutput {
  month: string;
  weeks: {
    date: string;
    count: number;
  }[][];
}

export const formatToMonths = (weeks: Week[]): MonthOutput[] => {

  const monthMap: Record<string, any[][]> = {};

  weeks.forEach(week => {
    week.contributionDays.forEach(day => {

      const dateObj = new Date(day.date);

      // 🔑 YEAR + MONTH key (important)
      const key = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;

      // 👀 Display label
      const label = dateObj.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric'
      });

      if (!monthMap[key]) {
        monthMap[key] = [];
        (monthMap[key] as any).label = label;
      }

      // week handling (7 days max)
      if (
        monthMap[key].length === 0 ||
        monthMap[key][monthMap[key].length - 1].length === 7
      ) {
        monthMap[key].push([]);
      }

      monthMap[key][monthMap[key].length - 1].push({
        date: day.date,
        count: day.contributionCount
      });
    });
  });

  // 🔁 Sort by year-month (important for rolling order)
  return Object.keys(monthMap)
    .sort((a, b) => {
      const [ay, am] = a.split('-').map(Number);
      const [by, bm] = b.split('-').map(Number);
      return ay !== by ? ay - by : am - bm;
    })
    .map(key => ({
      month: (monthMap[key] as any).label,
      weeks: monthMap[key]
    }));
};
