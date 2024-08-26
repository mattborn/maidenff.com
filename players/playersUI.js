fetch('/data/players.json')
  .then(response => response.json())
  .then(players => {
    const tableBody = document.querySelector('#players tbody')

    players.slice(0, 160).forEach((player, i) => {
      const row = document.createElement('tr')

      row.innerHTML = `
            <td>${i + 1}</td>
            <td>${player.name}</td>
            <td>${player.team}</td>
            <td>${player.position}</td>
            <td>${player.tenSeconds}</td>
            <td>${player.teamContext}</td>
            <td>${player.depthDissonance}</td>
          `

      tableBody.appendChild(row)
    })

    new DataTable('#players', {
      perPage: 160,
      perPageSelect: [],
    })
  })
  .catch(console.error)
