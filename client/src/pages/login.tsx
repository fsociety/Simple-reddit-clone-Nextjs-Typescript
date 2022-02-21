import Head from 'next/head'
import Link from 'next/link'
import React, { FormEvent, useState } from 'react'
import Axios from 'axios';
import InputGroup from '../components/InputGroup'
import { useRouter } from 'next/router'

import { useAuthDispatch, useAuthState } from '../context/auth'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<any>({})

  const dispatch = useAuthDispatch()
  const { authenticated } = useAuthState()

  const router = useRouter()
  if(authenticated) router.push('/')

  const submitForm = async (event : FormEvent) => {
    event.preventDefault()    

    try {
      const res = await Axios.post('/auth/login', {
        username,
        password
      }, { withCredentials: true })

      dispatch({ type: 'LOGIN', payload: res.data.user })

      router.back()
    } catch (err) {
      console.log(err)
      setErrors(err.response.data)
    }
  }

  return (
    <div className="flex w-full h-screen gap-0 text-white bg-gray-800">
      <Head>
        <title>Login</title>
      </Head>
      <div className="flex items-center justify-center w-full h-screen lg:w-3/4">
          <div className="max-w-xs pl-2 border-l-2">
            <h1 className="mb-2 text-2xl">
              Login
            </h1>            
            <form onSubmit={submitForm}>

              <InputGroup value={username} type="text" setValue={setUsername} placeholder="Username" error={errors.username} />

              <InputGroup value={password} type="password" setValue={setPassword} placeholder="Password" error={errors.password} />
              
              <button 
              type="submit"
              className="w-full mt-2 font-medium text-white uppercase transition duration-300 ease-in-out bg-blue-500 rounded-sm hover:bg-blue-700 h-9">
                Login              
              </button>
            </form>
            <small className="block mt-3">
              Don't you have an account?
              <Link href="/register">
                <a className="ml-1 text-blue-500 uppercase">Sign In</a>
              </Link>
            </small>
          </div>
        </div>
        <div className="items-center justify-start hidden w-full h-screen lg:flex lg:w-1/4">       
          <h1 className="text-6xl font-bold">Quinlan</h1>
        </div>        
    </div>
  )
}