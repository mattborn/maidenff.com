// this file generates /data/players.json

const axios = require('axios')
const fs = require('fs')
const path = require('path')

let players = {}
const playersFile = path.join(__dirname, '../data/players.json')
if (fs.existsSync(playersFile)) players = JSON.parse(fs.readFileSync(playersFile, 'utf8')).players

const schema = {
  insights: {
    depthDissonance:
      'tell me if there are any concerns about this players position on the depth chart and the opportunities they will have on the field this season',
    teamContext:
      'tell me about any changes to coaching, the quarterback, or the offensive line since last season that may impact this player specifically',
    tenSeconds: 'tell me about their 2024 fantasy value in 35 words or less',
  },
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

const enrichAllPlayers = async () => {
  for (const player of players) {
    try {
      console.log(`Enriching data for ${player.name}...`)
      console.time(`Fetched data via Perplexity for ${player.name} in`)

      const response = await axios.post(
        'https://us-central1-samantha-374622.cloudfunctions.net/perplexity',
        {
          model: 'llama-3-sonar-large-32k-online',
          messages: [
            {
              role: 'user',
              content: `Summarize valuable, up-to-date insights about ${
                player.name
              } in the upcoming NFL fantasy football 2024 season. Return only a JSON object that copies this schema: ${JSON.stringify(
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
      const { insights } = data
      Object.assign(player, insights)
      fs.writeFileSync(playersFile, JSON.stringify(players, null, 2))
      console.timeEnd(`Fetched data via Perplexity for ${player.name} in`)
    } catch (error) {
      console.error(`Error fetching data for ${player.name}:`, error)
    }
  }
  console.log('All players have been enriched and saved.')
}

enrichAllPlayers()
