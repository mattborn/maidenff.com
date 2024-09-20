// this file generates /data/players.json

const axios = require('axios')
const fs = require('fs')
const path = require('path')

let teams = {}
const teamsFile = path.join(__dirname, '../data/teams.json')
if (fs.existsSync(teamsFile)) teams = JSON.parse(fs.readFileSync(teamsFile, 'utf8')).players

const schema = {
  plus: {},
}

const toJSON = str => {
  const curly = str.indexOf('{')
  const square = str.indexOf('[')
  let first
  if (curly < 0) first = '[' // only for empty arrays
  else if (square < 0) first = '{'
  else first = curly < square ? '{' : '['
  const last = first === '{' ? '}' : ']'
  // ensure JSON is complete
  let count = 0
  for (c of str) {
    if (c === '{' || c === '[') count++
    else if (c === '}' || c === ']') count--
  }
  if (!count) return JSON.parse(str.slice(str.indexOf(first), str.lastIndexOf(last) + 1))
}

const enrichAllTeams = async () => {
  for (const [teamName, teamData] of Object.entries(teams)) {
    try {
      console.log(`Enriching data for ${teamName}...`)
      console.time(`Fetched data via Perplexity for ${teamName} in`)

      const response = await axios.post(
        'https://us-central1-samantha-374622.cloudfunctions.net/perplexity',
        {
          model: 'llama-3-sonar-large-32k-online',
          messages: [
            {
              role: 'user',
              content: `Summarize valuable, up-to-date insights about the ${teamName} in the upcoming NFL fantasy football 2024 season. Return only a JSON object that copies this schema: ${JSON.stringify(
                schema,
              )} and use the values as hints.`,
            },
          ],
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )
      const data = typeof response.data === 'string' ? toJSON(response.data) : response.data
      const { plus } = data
      Object.assign(player, plus)
      fs.writeFileSync(teamsFile, JSON.stringify(teams, null, 2))
      console.timeEnd(`Fetched data via Perplexity for ${teamName} in`)
    } catch (error) {
      console.error(`Error fetching data for ${teamName}:`, error)
    }
  }
  console.log('All teams have been enriched and saved.')
}

enrichAllTeams()
