const axios = require('axios')
const cheerio = require('cheerio')

const scrapeStats = async year => {
  const url = `https://www.pro-football-reference.com/years/${year}/#team_stats`

  try {
    const { data } = await axios.get(url)
    const $ = cheerio.load(data)

    const teams = []

    // Scrape the team stats
    $('#div_team_stats .full_table').each((index, element) => {
      // full_table doesn’t exist
      const teamName = $(element).find('th[data-stat="team"]').text().trim()
      const divisionRank = $(element).find('td[data-stat="div_rank"]').text().trim()
      const overallRank = $(element).find('td[data-stat="rank_playoffs"]').text().trim()
      const OSRS = $(element).find('td[data-stat="srs_offense"]').text().trim()
      const DSRS = $(element).find('td[data-stat="srs_defense"]').text().trim()

      teams.push({
        teamName,
        divisionRank,
        overallRank,
        OSRS,
        DSRS,
      })
    })

    return teams
  } catch (error) {
    console.error(`Error fetching data for ${year}:`, error.message)
    return []
  }
}

const scrapeMultipleSeasons = async (startYear, seasons) => {
  for (let i = 0; i < seasons; i++) {
    const year = startYear - i
    console.log(`Scraping data for ${year}...`)
    const data = await scrapeStats(year)
    console.log(`Data for ${year}:`, data)
  }
}

// Scrape the past 5 seasons starting from 2023
scrapeMultipleSeasons(2023, 5)
