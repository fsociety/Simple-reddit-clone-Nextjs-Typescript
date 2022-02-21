import '../styles/globals.css'
import { AppProps } from 'next/app'
import Axios from 'axios';
import Navbar from '../components/Navbar'
import { useRouter } from 'next/router'
import { SWRConfig } from 'swr'

import { AuthProvider } from '../context/auth'

Axios.defaults.baseURL = 'http://localhost:5000/api'
Axios.defaults.withCredentials = true

const fetcher = async (url: string) => {
  try {
    const res = await Axios.get(url)
    return res.data
  } catch (err) {
    throw err.response.data
  }
}

function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter()
  const authRoutes = ['/login', '/register']
  const authRoute = authRoutes.includes(pathname)

  return (
    <SWRConfig
    value={{
      fetcher,
      dedupingInterval: 10000
     }}>
      <AuthProvider>
        { !authRoute && <Navbar />}
        <Component {...pageProps} />
      </AuthProvider>
    </SWRConfig>
  )
}

export default App
