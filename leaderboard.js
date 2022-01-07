let range = (n) => [...Array(n).keys()]

export default function createLeaderboard(teamTasks, individualTasks, name) {
  let isOnlyOneTasks = teamTasks.length == 0 || individualTasks.length == 0

  function Component({ data }) {
    return (
      <>
        <div style={{ textAlign: 'center' }}>
          <h1>Leaderboard командного этапа {name}</h1>
        </div>
        <div>
          <table>
            <thead>
              <tr>
                <td>№</td>
                <td>Название команды</td>
                <td className="task">Итого</td>
                {!isOnlyOneTasks && <td className="task">Командный этап</td>}
                {!isOnlyOneTasks && (
                  <td className="task">Индивидуальный этап</td>
                )}

                {range([...individualTasks, ...teamTasks].length).map((e) => (
                  <td key={e} className="task">
                    {e + 1}
                  </td>
                ))}
                <td>Магия</td>
                <td>Участники</td>
              </tr>
            </thead>
            <tbody>
              {data.map((e, i) => (
                <tr key={e.team}>
                  <td>{i + 1}</td>
                  <td>{e.team}</td>
                  <td>{e.total.toFixed(3)}</td>
                  {!isOnlyOneTasks && <td>{e.teamTasks.toFixed(3)}</td>}
                  {!isOnlyOneTasks && <td>{e.individualTasks.toFixed(3)}</td>}
                  {e.tasks.map((e, i) => (
                    <td key={i}>{e}</td>
                  ))}
                  <td
                    style={{
                      color:
                        e.pp < 100 ? (e.pp < 70 ? '#009879' : '#F80') : '#F00'
                    }}
                  >
                    {e.pp}
                  </td>
                  <td>{e.players.map((e) => e.trim()).join('; ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  function preprocessTeamname(teamname){
    teamname = teamname.trim()
    teamname = teamname.replace(/крутые/i, 'не крутые')
    // if(teamname.slice(0,6) == 'Крутые') teamname =  'Не ' + teamname.toLowerCase()
    if(teamname.length > 35) return teamname.slice(0, 32) + '...'
    return teamname
  }

  function teamCompare(team1, team2){
    team1 = team1.toLowerCase()
    team2 = team2.toLowerCase()

    team1 = team1.replace(/\s/g, '')
    team2 = team2.replace(/\s/g, '')

    if(team1 == "glowdan") team1 = "hoi4"
    if(team2 == "glowdan") team2 = "hoi4"

    return team1 == team2
  }

  async function queryTable(id) {
    let data = await fetch(`https://sim.avt.global/public/${id}`, {})
    data = await data.text()
    data = data.replace(/\n/g, '')
    data = /<tbody>(.*)<\/tbody>/gm.exec(data)[1]
    data = data.split('<tr>')
    // console.log(data)
    data = data.map((e) =>
      [...e.matchAll(/<td>([^>]*)<\/td>/gm)].map((e) => e[1])
    )
    data = data.filter((e) => e.length > 3)
    data = data.map((e) => ({
      score: parseFloat(e[0]),
      team: preprocessTeamname(e[3].length > 1 ? e[3] : e[1]),
      player: preprocessTeamname(e[1])
    }))
    return data
  }

  function combine(taskBoards) {
    let teams = []
    for (let i = 0; i < taskBoards.length; i++) {
      const taskBoard = taskBoards[i]
      for (const score of taskBoard) {
        let teamIndex = teams.findIndex((e) => teamCompare(e.team, score.team))
        if (teamIndex == -1) {
          teams.push({
            team: score.team,
            tasks: [...individualTasks, ...teamTasks].map(() => 0),
            players: []
          })
          teamIndex = teams.findIndex((e) => teamCompare(e.team, score.team))
        }
        if (!teams[teamIndex].players.includes(score.player))
          teams[teamIndex].players.push(score.player)
        if (teams[teamIndex].tasks[i] < score.score)
          teams[teamIndex].tasks[i] = score.score
      }
    }
    let pp = 0;
    teams.forEach((e) => {
      e.total = e.tasks.reduce((a, b) => a + b, 0)
      e.teamTasks = e.tasks
        .slice(individualTasks.length)
        .reduce((a, b) => a + b, 0)
      e.individualTasks = e.tasks
        .slice(0, individualTasks.length)
        .reduce((a, b) => a + b, 0)
    })
    teams =  teams.sort((a, b) => b.total - a.total)
    teams.forEach(e=>{
      
      pp+=e.players.length
      e.pp = pp
    })
    return teams
  }

  async function getServerSideProps() {
    // console.log([...individualTasks, ...teamTasks])
    const taskBoads = await Promise.all(
      [...individualTasks, ...teamTasks].map(queryTable)
    )
    // console.log(taskBoads)
    return {
      props: {
        data: combine(taskBoads)
      }
    }
  }

  return {
    component: Component,
    getServerSideProps
  }
}
