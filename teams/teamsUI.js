const g = document.getElementById.bind(document)
// const q = document.querySelectorAll.bind(document)

const insert = (target = document.body, tag = 'div') => {
  const el = document.createElement(tag)
  target.appendChild(el)
  return el
}

fetch('/data/mvp.json')
  .then(response => response.json())
  .then(data => {
    for (const t in data.teams) {
      const team = data.teams[t]

      const card = insert(g('teams'))
      card.className = 'team'
      card.style.background = team.colorHex1
      card.style.color = team.colorHex2

      const division = insert(card)
      division.className = 'team-division'
      division.textContent = team.division

      const city = insert(card)
      city.className = 'team-city'
      city.textContent = team.city

      const name = insert(card)
      name.className = 'team-name'
      name.textContent = team.name
    }
  })
  .catch(console.error)
