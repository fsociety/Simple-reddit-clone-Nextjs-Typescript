import { useRouter } from "next/router"
import Link from "next/link"
import Head from "next/head"
import useSWR from "swr"
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Gravatar from '../../components/Gravatar';

dayjs.extend(relativeTime)

import PostCard from '../../components/PostCard'
import { useAuthState } from "../../context/auth"
import { useState } from "react"
import axios from "axios"

export default function user() {
    const router = useRouter()
    const username = router.query.username
    const { loading, user } = useAuthState()
    const [isContenteditable, setIsContenteditable] = useState(false)
    //const [bio, setBio] = useState('')

    const { data, error } = useSWR<any>(username ? `/users/${username}` : null)
    if(error) router.push('/')

    //if(data) console.log(data);

    const editBio = async (e) => {
        if(isContenteditable === false){
            e.target.previousSibling.setAttribute("contenteditable",true)
            e.target.previousSibling.focus()
            setIsContenteditable(true)
        }else if(isContenteditable === true){
            const bioP = e.target.previousSibling
            let bio = bioP.innerText
            await axios.post(`/users/${username}/profile`,{bio})
            bioP.setAttribute("contenteditable",false)
            setIsContenteditable(false)
        }

        e.target.classList.toggle('fa-edit')
        e.target.classList.toggle('fa-save')
    }

    return (
        <>
        <Head>
            <title>{data?.user.username}</title>
        </Head>
        {data && (

            <div className="container flex justify-start h-full pt-4">

            <div className="w-full h-full md:w-4/6 text-gray-50">
                { data.submissions.length == 0 ? (
                    <div className="w-full p-3 text-center bg-gray-600 rounded-md">No posts submitted yet</div>
                ) : null }
                {data.submissions.map((item:any) => {
                    if(item.type == 'Post'){
                        return <PostCard post={item} key={item.identifier} />
                    }else{
                        return (
                            <div className="flex flex-row w-full h-full mb-3 bg-gray-500 rounded-md" key={item.identifier}>
                                <div className="w-full px-3 py-2">
                                <div className="flex flex-col items-start justify-start w-full mb-2">
                                    <div>
                                    <div className="flex items-center">
                                        <Link href={`/s/${item.post.subName}`}>
                                        <a className="inline ml-2 text-sm font-bold tracking-widest cursor-pointer hover:underline">
                                            {item.post.subName}
                                        </a>
                                        </Link>
                                        <div className="flex items-center ml-2 text-gray-200">
                                        <i className="mr-1 text-gray-800 fas fa-caret-right"></i>
                                        <Link href={`/u/${item.username}`}>
                                        <span className="text-xs cursor-pointer hover:underline">Posted by {item.username} </span>
                                        </Link>
                                        <span className="ml-2 text-xs cursor-pointer hover:underline"> {dayjs(item.createdAt).fromNow()} </span>
                                        <Link href={`/s/${item.post.subName}/${item.post.identifier}/${item.post.slug}`}>
                                        <span className="px-2 py-1 ml-2 text-xs font-normal text-white bg-gray-700 rounded-sm cursor-pointer hover:bg-blue-500">
                                            Comment
                                        </span>
                                        </Link>
                                    </div>
                                    </div>                                    
                                    </div>
                                    <div className="flex flex-col pl-2">
                                    <Link href={`/s/${item.post.subName}/${item.post.identifier}/${item.post.slug}`}>
                                        <h1 className="mt-1 mb-1 text-xs text-white cursor-pointer hover:underline">
                                            {item.post.title}
                                        </h1>
                                    </Link>
                                    <div className="text-sm text-left text-gray-200">
                                        {item.body}
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        )
                    }
                })}
            </div>

            <div className="hidden h-full px-2 md:block md:w-2/6">
            <div className="w-full bg-gray-500 rounded-md">
                <div className="py-2 text-lg font-medium text-center text-white bg-gray-700 border border-gray-500 rounded-t-md">
                  <div className="w-auto mx-auto overflow-hidden border-2 border-gray-500 rounded-full" style={{ width:60,height:60 }}>
                    <Gravatar 
                    src={data.user.email}
                    size={60}
                     />
                  </div>
                </div>                
                <div className="w-full text-gray-50">
                    <div className="flex flex-col items-center justify-center py-2 text-lg font-semibold">                        
                        { data.user.username }
                    </div>
                    <div className="px-2 pb-3 text-sm">
                    <p className="inline outline-none">
                        { data.user.bio }
                    </p>
                    { !loading && (user.username === username ? (<i className="ml-1 cursor-pointer fas fa-edit" onClick={editBio}></i>) : null ) }
                    </div>
                    <p className="flex items-center justify-center py-3 text-sm border-t border-gray-400">
                    <i className="mr-1 text-gray-800 fas fa-birthday-cake"></i>
                      Joined { dayjs(data.user.createdAt).format('MMM YYYY') }
                    </p>
                </div>
              </div>
            </div>

            </div>

        )}
        
        </>
    )
}
