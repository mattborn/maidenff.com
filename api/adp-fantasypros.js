console.time('Fetched top 300+ players from Fantasy Pros in')

const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

const teamNameMap = {
  ARI: 'Arizona Cardinals',
  ATL: 'Atlanta Falcons',
  BAL: 'Baltimore Ravens',
  BUF: 'Buffalo Bills',
  CAR: 'Carolina Panthers',
  CHI: 'Chicago Bears',
  CIN: 'Cincinnati Bengals',
  CLE: 'Cleveland Browns',
  DAL: 'Dallas Cowboys',
  DEN: 'Denver Broncos',
  DET: 'Detroit Lions',
  GB: 'Green Bay Packers',
  HOU: 'Houston Texans',
  IND: 'Indianapolis Colts',
  JAC: 'Jacksonville Jaguars', // JAX?!
  KC: 'Kansas City Chiefs',
  LV: 'Las Vegas Raiders',
  LAC: 'Los Angeles Chargers',
  LAR: 'Los Angeles Rams',
  MIA: 'Miami Dolphins',
  MIN: 'Minnesota Vikings',
  NE: 'New England Patriots',
  NO: 'New Orleans Saints',
  NYG: 'New York Giants',
  NYJ: 'New York Jets',
  PHI: 'Philadelphia Eagles',
  PIT: 'Pittsburgh Steelers',
  SEA: 'Seattle Seahawks',
  SF: 'San Francisco 49ers',
  TB: 'Tampa Bay Buccaneers',
  TEN: 'Tennessee Titans',
  WAS: 'Washington Commanders',
}

axios
  .get('https://www.fantasypros.com/nfl/adp/overall.php')
  .then(response => {
    const html = response.data
    const $ = cheerio.load(html)

    const players = []

    $('#data > tbody > tr').each((index, element) => {
      const name = $(element).find('.player-name').text().trim()
      const team = teamNameMap[$(element).find('td:nth-child(2) small:nth-child(2)').text().trim()]
      const position = $(element).find('td:nth-child(3)').text().trim()
      const fantasyProsStdRank = parseInt($(element).find('td:nth-child(1)').text().trim())
      const sleeperStdADP = $(element).find('td:nth-child(5)').text().trim()
      players.push({ name, team, position, fantasyProsStdRank, sleeperStdADP })
    })

    fs.writeFileSync(path.join(__dirname, '../data/players.json'), JSON.stringify({ players }, null, 2))
    console.timeEnd('Fetched top 300+ players from Fantasy Pros in')
  })
  .catch(console.error)
