import Link from 'next/link'

export default function Home() {
  return (
    <div className="index">
      <div>
        <h1
          style={{
            textAlign: 'center',
          }}
        >
          MCV Leaderboard
        </h1>
        <p>
          Leaderboard командных задач с платформы{' '}
          <Link href="https://sim.avt.global">
            sim.avt.global
          </Link>
        </p>
        <div className="links">
          <Link href="/av">
            <button>АТС</button>
          </Link>
          {/* <Link href="/bdml">
            <button>БДиМО</button>
          </Link> */}
        </div>
      </div>
    </div>
  )
}
