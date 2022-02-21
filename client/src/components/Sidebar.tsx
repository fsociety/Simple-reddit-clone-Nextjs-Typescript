import Link from 'next/link'
import Image from 'next/image'
import { Sub } from '../types'
import dayjs from 'dayjs'
import { useAuthState } from '../context/auth'

export default function Sidebar({ sub } : {sub: Sub}) {
    
    const { authenticated } = useAuthState()
    
    return (
        <>
        <div className="w-full bg-gray-500 rounded-md">
                <h1 className="py-3 text-lg font-medium text-center text-white bg-gray-700 border border-gray-500 rounded-t-md">
                  About
                </h1>                
                <div className="w-full p-3 pb-2 text-gray-50">
                    <p className="text-sm"> { sub.description } </p>
                    <div className="flex items-center justify-between my-2 text-sm ">
                        <div className="w-full font-bold">
                            5.2k members
                            </div>
                        <div className="w-full font-bold">
                            150 online
                        </div>
                    </div>
                    <p className="flex items-center text-sm">
                    <i className="mr-1 text-gray-800 fas fa-birthday-cake"></i> 
                      Created { dayjs(sub.createdAt).format('D MMM YYYY') }
                    </p>
                    { authenticated && (
                        <div className="flex justify-center w-full py-2 mx-auto mt-2">
                        <Link href={`/s/${sub.name}/submit`}>
                        <a className="w-4/6 px-1 py-2 text-center button blue">
                            Create Post
                        </a>
                        </Link>
                        </div>
                    ) }
                </div>
              </div>
        </>
    )
}
