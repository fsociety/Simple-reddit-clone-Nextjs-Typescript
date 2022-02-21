import Head from 'next/head'
import Link from 'next/link'
import React, { FormEvent, useState } from 'react'
import Axios from 'axios';
import InputGroup from '../components/InputGroup'
import { useRouter } from 'next/router'

import { useAuthState } from '../context/auth'

export default function Register() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [agreement, setAgreement] = useState(false)  
  const [errors, setErrors] = useState<any>({})

  const { authenticated } = useAuthState()

  const router = useRouter()
  if(authenticated) router.push('/')

  const submitForm = async (event : FormEvent) => {
    event.preventDefault()
    if(!agreement){
      setErrors({...errors, agreement: 'You must agree to T&Cs'})
      return
    }

    try {
      await Axios.post('/auth/register', {
        email,
        username,
        password
      })

      router.push('/login')
    } catch (err) {
      console.log(err)
      setErrors(err.response.data)
    }
  }

  return (
    <div className="flex w-full h-screen gap-0 text-white bg-gray-800">
      <Head>
        <title>Register</title>
      </Head>
      <div className="flex items-center justify-center w-full h-screen lg:w-3/4">
          <div className="max-w-xs pl-2 border-l-2">
            <h1 className="mb-2 text-2xl">
              Sign Up
            </h1>
            <p className="mb-3 text-xs">
            By continuing, you agree to our User Agreement and Privacy Policy.
            </p>
            <form onSubmit={submitForm}>
              <input 
              type="checkbox" 
              id="agreement" 
              className="mr-2 outline-none cursor-pointer"
              checked={agreement}
              onChange={ e => setAgreement(e.target.checked) }
              required />
              <label htmlFor="agreement" className="text-xs cursor-pointer">
                I agree to get emails about cool stuff on Quinlan <br />
                <small className="font-medium text-red-600"> { errors.agreement } </small>
              </label>              
              <InputGroup value={email} type="email" setValue={setEmail} placeholder="Email" error={errors.email} />

              <InputGroup value={username} type="text" setValue={setUsername} placeholder="Username" error={errors.username} />

              <InputGroup value={password} type="password" setValue={setPassword} placeholder="Password" error={errors.password} />
              
              <button 
              type="submit"
              className="w-full mt-2 font-medium text-white transition duration-300 ease-in-out bg-blue-500 rounded-sm hover:bg-blue-700 h-9">
                SIGN UP               
              </button>
            </form>
            <small className="block mt-3">
              Already have an account? 
              <Link href="/login">
                <a className="ml-1 text-blue-500 uppercase">Log In</a>
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