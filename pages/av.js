import createLeaderboard from '../leaderboard'

const { component, getServerSideProps } = createLeaderboard(
  [],
  [58, 59, 63, 62, 64],
  'АТС'
)
// console.log(component)
export default component
export { getServerSideProps }
