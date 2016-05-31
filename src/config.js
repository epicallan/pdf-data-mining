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
  },
  {
    tableTitle: 'Annex A1.1'
  },
  {
    tableTitle: 'Annex A1.2'
  },
  {
    tableTitle: 'FY 2015/16 PAF'
  }
];

// responsible for table titles
// this is for all the tables that are alike
export const transformRegular = row => ({
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
// 2011 -2012 overview tables dont have the Cashlimits column and hence have less fields
const rowStructure = row => {
  if (row.length === 10) {
    return { // rest of the years
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
    };
  }
  return { // 2011-12 tables
    'Vote Name': row[8],
    'Table Name': row[7],
    Category: row[0],
    'Approved Budget': row[1],
    'Released by End': row[2],
    'Spent by End Jun': row[3],
    '% Budget Released': row[4],
    '% Budget spent': row[5],
    '% Releases spent': row[6]
  };
};

export const transformOverview = row => rowStructure(row);

export const transformForAnnexTables = row => ({
  'Annex Type': row[0],
  Section: row[1],
  'Approved Estimates wage': row[2],
  'Approved Estimates Non Wage': row[3],
  'Approved Estimates GoU Dev': row[4],
  'Approved Estimates GoU Total': row[5],
  'Budget Projections June Wage': row[6],
  'Budget Projections June Non Wage': row[7],
  'Budget Projections June Gou Dev': row[8],
  'Budget Projections June GoU Total': row[9],
  'Expenditure by End June Wage': row[10],
  'Expenditure by End June Non Wage': row[11],
  'Expenditure by End June Gou Dev': row[12],
  'Expenditure by End June GoU Total': row[13],
  'Performance by End June Wage': row[14],
  'Performance by End June Non Wage': row[15],
  'Performance by End June Gou Dev': row[16],
  'Performance by End June GoU Total': row[17]

});

export const transformForEstimates = row => ({
  'Table Title': row[0],
  Section: row[1],
  'Approved Budget Rec': row[2],
  'Approved Budget Dev': row[3],
  'Approved Budget Total': row[4],
  'Budget Projections Rec': row[5],
  'Budget Projections Dev': row[6],
  'Budget Projections Total': row[7]
});
