import Axios from 'axios'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import Gravatar from '../components/Gravatar';

import { useAuthState, useAuthDispatch } from '../context/auth'
import { Sub } from '../types'

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [subs, setSubs] = useState<Sub[]>([])
  const [timer, setTimer] = useState(null)

  const { authenticated, loading, user } = useAuthState()
  const dispatch = useAuthDispatch()  

  useEffect(() => {
    if(searchQuery.trim() === ''){
      setSubs([])
      return
    }

    searchSubs()
  }, [searchQuery])

  const searchSubs = async () => {
    clearTimeout(timer)
    setTimer(setTimeout(async () => {
      try {
        const { data } = await Axios.get(`/subs/search/${searchQuery}`)
        setSubs(data)
        console.log(data)
      } catch (err) {
        console.log(err)
      }
    }, 400))
  }

  const logout = () => {
    Axios.get('/auth/logout')
    .then(() => {
      dispatch({ type:'LOGOUT' })
      window.location.reload()
    })
    .catch(err => console.log(err))
  }
    return <div className="sticky inset-x-0 top-0 z-10 flex items-center justify-between w-full h-16 px-4 bg-gray-700 shadow-md">
        <div className="flex items-center justify-start w-full h-full text-lg font-bold text-white cursor-pointer">
          <Link href='/'>
            Quinlan
          </Link>
        </div>
        <div className="relative items-center justify-center hidden w-full h-full md:flex">
          <div className="relative flex items-center justify-center w-full h-full">
            <button className="absolute inset-y-0 m-auto border-gray-400 outline-none border-1 focus:outline-none left-2">
            <i className="text-gray-500 fas fa-search"></i>
            </button>
            <input
            className="w-full pl-8 pr-3 text-sm placeholder-gray-500 bg-gray-200 border rounded-sm shadow-lg outline-none hover:border-opacity-40 hover:border-blue-500 h-2/4"
            placeholder="Search"
            id="search"
            onChange={e => setSearchQuery(e.target.value)}
            value={searchQuery}
            type="text"/>
          </div>
          {searchQuery && (
            <div className="absolute left-0 right-0 w-full py-2 bg-white rounded-b-md" style={{ top:'80%' }}>
              { subs?.map(s => {
                return (
                  <div className="w-full py-2 border-t border-b cursor-pointer hover:bg-gray-500" onClick={() => {
                    setSearchQuery('')
                  }}>
                    <div className="flex items-center justify-start w-full px-2">
                      <Link href={`/s/${s.name}`}>
                      <a className="flex items-center w-full">
                        <Image
                        className="inline w-auto rounded-full cursor-pointer"
                        src={s.imageUrl}
                        width={40}
                        height={40}
                        />
                        <div className="flex flex-col">
                        <span className="inline ml-2 text-sm font-bold tracking-widest cursor-pointer hover:underline">
                            {s.title}
                          </span>
                          <span className="inline ml-2 text-xs font-bold tracking-widest cursor-pointer hover:underline">
                            {s.name}
                          </span>
                        </div>
                      </a>
                      </Link>
                    </div>
                  </div>
                )
              }) }
              {subs.length === 0 ? (
                <span className="px-2 text-xs">
                  No result
                </span>
              ) : null}
            </div>
          )}
          
        </div>
        <div className="items-center justify-end hidden w-full h-full md:flex">
          {!loading && (authenticated ? (
            <>
            <div 
            onClick={(e) => {
              let pmenu = e.currentTarget.querySelectorAll("div.absolute")[0];
              pmenu.classList.toggle('hidden')
            }}
            className="relative flex items-center justify-end h-12 px-1 border border-transparent rounded-sm cursor-pointer hover:border-gray-400">
            <div className="mr-2 text-white">
            <i className="mr-2 fas fa-caret-down"></i>
              {user.username}
            </div>
            <div className="w-auto mx-auto overflow-hidden border-2 border-gray-500 rounded-full" 
            style={{ width:40,height:40 }}>
            <Gravatar 
            src={user.email}
            size={40}
              />
            </div>

            <div className="absolute right-0 hidden w-48 p-2 bg-white rounded-sm" style={{ top:'100%' }}>
              <Link href={`/u/${user.username}`}>
              <a className="block w-full px-2 py-1 rounded-sm hover:bg-gray-800 hover:text-white">
              <i className="mr-2 fas fa-user-circle"></i>
              Profile
              </a>
              </Link>
              <a onClick={logout} className="block w-full px-2 py-1 rounded-sm hover:bg-gray-800 hover:text-white">
              <i className="mr-2 fas fa-sign-out-alt"></i>
              Logout
              </a>
            </div>
            </div>
            </>
          ): (
            <>
            <Link href="/login">
            <a className="mr-4 button hollow">
              Log In
            </a>
            </Link>
            <Link href="/register">
              <a className="button blue">
                Sign In
              </a>
            </Link>
            </>
          ))}          
        </div>
      </div>
}

export default Navbar;