export const budgetSegmentsToRead = [
  {
    tableTitle: 'GoU Releases and Expenditure by Output',
  },
  {
    tableTitle: 'Highlights of Vote Performance',
  },
  {
    tableTitle: 'GoU Expenditure by Item',
  },
  {
    tableTitle: 'GoU Releases and Expenditure by Project and Programme'
  },
  {
    tableTitle: 'External Financing Releases and Expenditure'
  },
  {
    tableTitle: 'Releases and Expenditure by Vote Function'
  },
  {
    tableTitle: 'Overview of Vote Expenditures'
  },
  {
    tableTitle: 'Overview of Vote Expenditures'
  }
];

// responsible for table titles
// this is for all the tables that are alike
export const transformRegular = (row) => ({
  'Vote Name': row[8],
  'Table Name': row[7],
  Sector: row[0],
  'Approved Budget': row[1],
  released: row[2],
  spent: row[3],
  '% Budget released': row[4],
  '% budget spent': row[5],
  '% releases spent': row[6]
});
// overviewVoteExpenditure tables have different table names and structure
export const transformOverview = (row) => ({
  'Vote Name': row[9],
  'Table Name': row[8],
  Category: row[0],
  'Approved Budget': row[1],
  'Cashlimits by End': row[2],
  'Released by End': row[3],
  'Spent by End Jun': row[4],
  '% Budget Released': row[5],
  '% Budget spent': row[6],
  '% Releases spent': row[7]
});
