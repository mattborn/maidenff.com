// this file generates /data/players.json

const axios = require('axios')
const fs = require('fs')
const path = require('path')

const playersPerBatch = 20
const totalPlayers = 160 // 192 is next rung

const players = {}
const playersFile = path.join(__dirname, '../data/players.json')
if (fs.existsSync(playersFile)) players = JSON.parse(fs.readFileSync(playersFile, 'utf8')).players

const getPlayerNames = () => Object.keys(players).join(', ')

const schema = {
  players: {
    'Tyreek Hill': {
      team: 'Miami Dolphins',
      depth: 'WR1',
      adp: 2,
      adpSource: 'ESPN',
      adpSourceLastUpdated: '2024-08-26',
    },
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

const fetchPlayers = async () => {
  let fetchedPlayers = Object.keys(players).length

  while (fetchedPlayers < totalPlayers) {
    console.time(`Fetched batch of ${playersPerBatch} players`)
    try {
      const response = await axios.post(
        'https://us-central1-samantha-374622.cloudfunctions.net/perplexity',
        {
          model: 'llama-3-sonar-large-32k-online',
          messages: [
            {
              role: 'user',
              content: `Generate the next top ${playersPerBatch} NFL players in 2024 fantasy football drafts based on average draft posiiton (ADP) with their team, position depth on their team, adp, apdSource, and the date for that source’s most recent update, excluding these players: ${getPlayerNames()}. Return only a JSON object that copies this schema: ${JSON.stringify(
                schema,
              )} and use the values as hints.`,
            },
          ],
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )

      const newPlayers = toJSON(response.data).players

      for (const player in newPlayers) {
        if (!players[player]) {
          players[player] = newPlayers[player]
          fetchedPlayers++
        }
      }

      fs.writeFileSync(playersFile, JSON.stringify({ players }, null, 2))
      console.timeEnd(`Fetched batch of ${playersPerBatch} players`)
      console.log(`Fetched ${fetchedPlayers} players so far...`)

      if (fetchedPlayers >= totalPlayers) break
    } catch (error) {
      console.error('Error fetching players:', error.message)
      break
    }
  }

  console.log(`Completed fetching ${fetchedPlayers} players.`)
}

fetchPlayers()
