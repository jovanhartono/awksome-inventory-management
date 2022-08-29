import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'

const Home: NextPage = () => {
  return (
    <>
        <Head>
            <title>Hello Awksome</title>
        </Head>
        <main>
            <h1 className="text-teal-500">awksome!</h1>
        </main>
    </>
  )
}

export default Home
