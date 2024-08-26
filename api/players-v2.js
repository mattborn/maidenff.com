// this file generates /data/players.json

const totalPlayers = 160 // next rung is 192

const axios = require('axios')
const fs = require('fs')
const path = require('path')

const schema = {
  players: ['Tyreek Hill', 'CeeDee Lamb', 'Christian McCaffrey'],
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

console.time(`Fetched batch of ${totalPlayers} players`)

axios
  .post(
    'https://us-central1-samantha-374622.cloudfunctions.net/perplexity',
    {
      model: 'llama-3-sonar-large-32k-online',
      messages: [
        {
          role: 'user',
          content: `Generate an array of the top ${totalPlayers} NFL players in 2024 fantasy football drafts based on average draft posiiton (ADP) and return only a JSON object that copies this schema: ${JSON.stringify(
            schema,
          )}.`,
        },
      ],
    },
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )
  .then(response => {
    fs.writeFileSync(path.join(__dirname, '../data/players.json'), JSON.stringify(toJSON(response.data), null, 2))
    console.timeEnd(`Fetched batch of ${totalPlayers} players`)
  })
  .catch(console.error)
