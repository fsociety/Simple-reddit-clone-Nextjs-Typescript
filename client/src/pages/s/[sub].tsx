import { useRouter } from "next/router";
import Head from 'next/head'
import Link from 'next/link'
import { ChangeEvent, createRef, useEffect, useState } from "react";
import useSWR from "swr";
import PostCard from '../../components/PostCard'
import Sidebar from '../../components/Sidebar'
import Image from 'next/image'
import classNames from 'classnames'

import { Sub } from '../../types'
import { useAuthState } from '../../context/auth'
import axios from "axios";

export default function SubPage(){
    // Local state
    const [ownsub, setOwnsub] = useState(false)
    // Global state
    const { authenticated, user } = useAuthState()
    //utils
    const router = useRouter()
    const fileInputRef = createRef<HTMLInputElement>()

    const subName = router.query.sub

    const { data: sub, error, revalidate } = useSWR<Sub>(subName ? `/subs/${subName}` : null)

    useEffect(() => {
        revalidate()
        if(!sub) return
        setOwnsub(authenticated && user.username === sub.username) 
    }, [sub])

    const openFileInput = (type:string) => {
        if(!ownsub) return
        fileInputRef.current.name = type
        fileInputRef.current.click()
    }

    const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files[0]

        const formData = new FormData()
        formData.append('file',file)
        formData.append('type',fileInputRef.current.name)

        try {
            await axios.post<Sub>(`/subs/${subName}/image`,formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            
            revalidate()
        } catch (err) {
            console.log(err)
        }
    }

    //TODO: Sub Delete
    const removeSub = async (subName) => {
        alert(subName);
    }

    let postsMarkup
    if(error){
        postsMarkup = <p className="text-lg text-center">{error.sub}</p>
        setTimeout(function(){ router.push('/') }, 3000);
    }else if(!sub){
        postsMarkup = <p className="text-lg text-center">Loading...</p>
    }else if(sub.posts.length === 0){
        postsMarkup = <p className="text-lg text-center">No posts submitted yet</p>
    }else {
        postsMarkup = sub.posts.map(post => {
            return <PostCard post={post} key={post.identifier} revalidate={revalidate} />  
        })
    }

    return (
    <div>
        <Head>
        <title> { router.query.sub } </title>
        </Head>
        {sub && (<>
        <div 
            onClick={() => openFileInput('banner')}
            className={classNames("w-full h-40 bg-gradient-to-r from-green-400 to-blue-500", {
                'cursor-pointer' : ownsub
            })}
            style={ sub.bannerUrl ? {
                backgroundImage: `url(${sub.bannerUrl})`,
                backgroundRepeat:'no-repeat',
                backgroundSize:'cover',
                backgroundPosition: 'center'
            } : null } >            
        </div>
        <div className="container absolute left-0 right-0 h-40 mx-auto top-16">
        <div className="container flex items-end h-full pb-1">
            <div className="flex items-end">
            <input type="file" hidden={true} ref={fileInputRef} onChange={uploadImage} />
            <div className={classNames("flex items-center", { 'cursor-pointer' : ownsub })}>                    
                <Image 
                src={sub.imageUrl}
                className="rounded-full"
                onClick={() => openFileInput('image')}
                width={70}
                height={70}
                />
            </div>
            <div className="flex flex-col items-start justify-center pb-1 ml-2 text-white">
                <span className="text-sm font-medium">
                    <i className="mr-1 text-gray-300 fas fa-caret-right"></i> { sub.name }
                </span>
                <h1 className="text-4xl font-bold"> { sub.title } </h1>
                <p className="text-base font-normal text-gray-50">
                    { sub.description }
                </p>
            </div>
            </div>
        </div>
        </div>
        <div className="container flex justify-start h-full pt-4">

        <div className="w-full h-full md:w-4/6 text-gray-50">            
            {postsMarkup}
        </div>
        
        <div className="hidden h-full px-2 md:block md:w-2/6">
              <Sidebar sub={sub} />
              {ownsub && (
                  <div className="flex items-center justify-between">
                    <Link href={`/subs/edit/${sub.name}`}>
                    <a className="flex items-center justify-center w-full mt-2 text-sm cursor-pointer button hollow">
                    Edit sub
                    </a>
                    </Link>
                    <a 
                    onClick={() => removeSub(sub.name)}
                    className="flex items-center justify-center w-4 px-4 py-2 mt-2 ml-1 text-lg text-red-400 cursor-pointer button hollow">
                        <i className="fas fa-trash-alt"></i>
                    </a>
                  </div>
              )}
              
        </div>

        </div>
        </>)}
    </div>        
    )
}