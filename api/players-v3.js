// this file generates /data/players.json

const axios = require('axios')
const fs = require('fs')
const path = require('path')

const totalPlayers = 160 // Adjust as needed
const playersFile = path.join(__dirname, '../data/players.json')
let players = []
let messages = [
  {
    role: 'user',
    content: `Generate an array of the top ${totalPlayers} NFL players in 2024 fantasy football drafts based on average draft position (ADP) and return only a JSON object that copies this schema: ${JSON.stringify(
      {
        players: ['Tyreek Hill', 'CeeDee Lamb', 'Christian McCaffrey'],
      },
    )}.`,
  },
]

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
  let fetchedPlayers = 0

  while (fetchedPlayers < totalPlayers) {
    console.time(`Fetching players (${fetchedPlayers}/${totalPlayers})`)
    try {
      const response = await axios.post(
        'https://us-central1-samantha-374622.cloudfunctions.net/perplexity',
        {
          model: 'llama-3-sonar-large-32k-online',
          messages: messages,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )

      const newPlayers = toJSON(response.data).players

      if (newPlayers && newPlayers.length > 0) {
        // Add new players to the list if they aren't already included
        newPlayers.forEach(player => {
          if (!players.includes(player)) {
            players.push(player)
            fetchedPlayers++
          }
        })

        // Update the message history to inform the model of progress
        messages.push({
          role: 'assistant',
          content: `So far, you've provided ${fetchedPlayers} players.`,
        })

        if (fetchedPlayers < totalPlayers) {
          messages.push({
            role: 'user',
            content: `That was only ${fetchedPlayers} of the ${totalPlayers} players I requested. Can you please provide the rest?`,
          })
        }

        // Write the updated players list to the file
        fs.writeFileSync(playersFile, JSON.stringify({ players }, null, 2))
      } else {
        console.log('No new players returned.')
        break
      }

      console.timeEnd(`Fetching players (${fetchedPlayers}/${totalPlayers})`)
    } catch (error) {
      console.error('Error fetching players:', error.message)
      break
    }
  }

  console.log(`Completed fetching ${fetchedPlayers} players.`)
}

fetchPlayers()
