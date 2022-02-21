import Axios from "axios"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import Editor from '../../../components/Editor'
import Head from "next/head"
import { FormEvent, useEffect, useState } from "react"
import useSWR from "swr"
import { Post, User } from "../../../types"

export default function editPost() {
    const router = useRouter()
    const { identifier, slug } = router.query
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')

    const { data: post, error } = useSWR<Post>(identifier && slug ? `/posts/${identifier}/${slug}` : null )
    if(error) router.push('/')

    const submitPost = async (event : FormEvent) => {
        event.preventDefault()
        if(title.trim() === '' || title.length > 300) return

        try {
            const {data: post} = await Axios.post<Post>(`/posts/edit/${identifier}/${slug}`, { title: title.trim(), body })
            
            router.push(`/s/${post.subName}/${post.identifier}/${post.slug}`)
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        setTitle(post?.title)
        setBody(post?.body)
    }, [post])

    return (
        <>
        <Head>
            <title>Edit your post</title>
        </Head>
        <div className="container flex justify-start h-full pt-4">

        <div className="w-full h-full md:w-4/6 text-gray-50">
            <div className="w-full mx-auto">
            <div className="flex items-center justify-start py-2">
                <small className="h-full pt-1 ml-2 italic font-extralight" style={{ fontSize:'10px' }}>
                     {title?.trim().length} / 300 </small>
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
            className="float-right mt-2 button blue">Update</button>
            </form>
            </div>
        </div>
        
        <div className="hidden h-full px-2 text-center text-white uppercase md:block md:w-2/6">
            <div className="mt-8 font-mono text-4xl font-bold">
                Edit <br /> Your Post
            </div>
        </div>

        </div>
        </>
    )
}

export const getServerSideProps : GetServerSideProps = async (props) => {
    try {
        const cookie = props.req.headers.cookie
        const identifier = props.query.identifier;
        const slug = props.query.slug;
        if(!cookie) throw new Error('Missing auth token cookie')

        const {data: user}  = await Axios.get<User>('/auth/me', {headers: { cookie }})
        const {data: post} = await Axios.get<Post>(`/posts/${identifier}/${slug}`)
        
        if(user.username != post.username) throw new Error('You are not owner of this sub')

        return { props: {} }
    } catch (err) {
        props.res.writeHead(307, { location: '/' }).end()
    }
}