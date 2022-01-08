import createLeaderboard from '../leaderboard'

const { component, getServerSideProps } = createLeaderboard(
  [],
  [58, 59, 63, 62, 64],
  'АТС',
  [15, 25, 20, 20, 20]
)
// console.log(component)
export default component
export { getServerSideProps }
