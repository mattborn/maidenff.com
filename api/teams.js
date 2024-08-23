// this file generates teams.json

console.time('Generated objects for 32 teams in')

const axios = require('axios')
const fs = require('fs')
const path = require('path')

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

const schema = {
  teams: {
    'Chicago Bears': {
      city: 'Chicago',
      name: 'Bears',
      colorHex1: '#abc123',
      colorHex2: '#def456',
      division: 'NFC North',
    },
  },
}

axios
  .post(
    'https://us-central1-samantha-374622.cloudfunctions.net/perplexity',
    {
      model: 'llama-3-sonar-large-32k-online',
      messages: [
        {
          role: 'user',
          content: `Generate the list of all 32 NFL teams with their city, name, colors, and division and return only a JSON object that copies this schema: ${JSON.stringify(
            schema,
          )} and use the values as hints`,
        },
      ],
    },
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )
  .then(response => {
    fs.writeFileSync(path.join(__dirname, '../data/mvp.json'), JSON.stringify(toJSON(response.data), null, 2))
    console.timeEnd('Generated objects for 32 teams in')
  })
  .catch(console.error)
