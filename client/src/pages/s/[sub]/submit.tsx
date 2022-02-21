import Axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useState} from "react";
import useSWR from "swr";
import { Post, Sub } from "../../../types";
import Sidebar from '../../../components/Sidebar'
import Editor from '../../../components/Editor'
import { GetServerSideProps } from "next";

export default function submit() {
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')

    const router = useRouter();         
    
    const { sub: subName } = router.query

    const { data: sub, error } = useSWR<Sub>(subName ? `/subs/${subName}` : null )
    if(error) router.push('/')

    const submitPost = async (event : FormEvent) => {
        event.preventDefault()
        if(title.trim() === '' || title.length > 300) return

        try {
            const {data: post} = await Axios.post<Post>('/posts', { title: title.trim(), body, sub: sub.name })
            
            router.push(`/s/${sub.name}/${post.identifier}/${post.slug}`)
        } catch (err) {
            console.log(err);
        }
    }

       

    return (
        <>
        <Head>
            <title>Submit your post</title>
        </Head>
        <div className="container flex justify-start h-full pt-4">

        <div className="w-full h-full md:w-4/6 text-gray-50">
            <div className="w-full mx-auto">
            <div className="flex items-center justify-start py-2">
                <span className="h-full">Submit to {subName}</span>
                <small className="h-full pt-1 ml-2 italic font-extralight" style={{ fontSize:'10px' }}>
                     {title.trim().length} / 300 </small>
            </div>
            <form onSubmit={submitPost}>
            <input 
            type="text"
            autoComplete="off"
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
            maxLength={300}
            value={title}
            className="w-full h-8 px-2 py-1 mb-2 text-sm text-gray-800 rounded-sm focus:outline-none" />
            <Editor value={body} onChange={e => setBody(e)} />
            <button
            type="submit" 
            className="float-right mt-2 button blue">Submit</button>
            </form>
            </div>
        </div>
        
        <div className="hidden h-full px-2 md:block md:w-2/6">
            {sub && <Sidebar sub={sub} />}
        </div>

        </div>
        </>
    )
}

export const getServerSideProps : GetServerSideProps = async ({ req, res }) => {
    try {
        const cookie = req.headers.cookie
        if(!cookie) throw new Error('Missing auth token cookie')

        await Axios.get('/auth/me', {headers: { cookie }})

        return { props: {} }
    } catch (err) {
        res.writeHead(307, { location: '/login' }).end()
    }
}