export const budgetSegmentsToRead = [
  {
    tableTitle: 'GoU Releases and Outturn by Output',
  },
  {
    tableTitle: 'Highlights of Vote Performance',
  },
  {
    tableTitle: 'GoU Outturn by Item',
  },
  {
    tableTitle: 'GoU Releases and Outturn by Project and Programme'
  },
  {
    tableTitle: 'External Financing Releases and Outturn'
  },
  {
    tableTitle: 'Releases and Outturn by Vote Function'
  },
  {
    tableTitle: 'Overview of Vote Outturns'
  },
  {
    tableTitle: 'Overview of Vote Outturns'
  },
  {
    tableTitle: 'Annex A1.1'
  },
  {
    tableTitle: 'Annex A1.2'
  },
  {
    tableTitle: 'FY 2015/16 PAF'
  },
  {
    tableTitle: 'Approved Estimates of Outturn by Vote and Vote Function'
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
// overviewVoteOutturn tables have different table names and structure
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
  'Approved Estimates  Non Wage': row[3],
  'Approved Estimates GoU Dev': row[4],
  'Approved Estimates GoU Total': row[5],
  'Releases by June Wage': row[6],
  'Releases by June Non Wage': row[7],
  'Releases by June Gou Dev': row[8],
  'Releases by June GoU Total': row[9],
  'Outturn by End June Wage': row[10],
  'Outturn by End June Non Wage': row[11],
  'Outturn by End June Gou Dev': row[12],
  'Outturn by End June GoU Total': row[13],
  'Performance Wage': row[14],
  'Performance Non Wage': row[15],
  'Performance Dev': row[16],
  'Performance GoU Budget Released': row[17],
  'Performance GoU Budget Spent': row[18],
  'Performance GoU Releases Spent': row[19]
});

export const transformForPAFTable = row => ({
  'Table Title': row[0],
  Section: row[1],
  'Approved Budget Rec': row[2],
  'Approved Budget Dev': row[3],
  'Approved Budget Total': row[4],
  'Development Rec': row[5],
  'Development Dev': row[6],
  'Development Total': row[7]
});


export const transformForEstimates = row => ({
  'Table Name': row[0],
  Section: row[1],
  'Recurrent wage': row[2],
  'Recurrent Non Wage': row[3],
  'Recurrent Arrears': row[4],
  'Recurrent Total Rect': row[5],
  'Development GoU Devt': row[6],
  'Development Donor Devt': row[7],
  'Development Gou Arrears': row[8],
  'Development GoU Taxes': row[9],
  'Total Devt': row[10],
  'Total Budget': row[11],
  'Taxes Arrears': row[12],
  AIA: row[13],
  'Grand Total inc,AIA': row[14],
  'Taxes, Arrears': row[15]
});
