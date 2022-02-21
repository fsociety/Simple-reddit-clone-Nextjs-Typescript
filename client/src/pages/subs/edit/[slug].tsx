import Axios from "axios"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import Head from "next/head"
import { FormEvent, useEffect, useState } from "react"
import Sidebar from '../../../components/Sidebar'
import { Sub, User } from "../../../types"
import useSWR from "swr"

export default function EditSub() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    
    const [errors, setErrors] = useState<Partial<any>>({})
    
    const router = useRouter()
    const { slug: subName } = router.query

    const { data: sub } = useSWR<Sub>(subName ? `/subs/${subName}` : null)

    useEffect(() => {
        setTitle(sub?.title)
        setDescription(sub?.description)
    }, [sub])

    const submitForm = async (event: FormEvent) => {
        event.preventDefault()

        try {
            const res = await Axios.post(`/subs/update/${subName}`, { title, description })

            router.push(`/s/${subName}`)
        } catch (err) {
            console.log(err)
            setErrors(err.response.data)
        }
    }

    return (
        <>
        <Head>
            <title> {subName}: Update </title>
        </Head>
        <div 
        style={{ 
            height:'calc(100vh - 4rem)',
            background:'url(https://source.unsplash.com/1920x1080/) no-repeat center / cover'
        }}
        className="flex items-center justify-start">
            <div
            className="absolute top-0 left-0 z-0 w-full h-full" 
            style={{ backgroundColor:'rgba(31, 41, 55, .8)' }}></div>
            <div className="absolute top-0 bottom-0 left-0 flex items-center justify-between w-full">
                <div className="p-4 ml-4 bg-gray-900 rounded-sm w-80">
                    <form onSubmit={ submitForm }>
                    <h1 className="block mb-3 text-2xl text-white lg:hidden">
                        {subName}: Update
                    </h1>
                    <div className="mt-4">
                        <label 
                        className="text-white text-md"
                        htmlFor="title">
                            Title
                        </label>
                        <small className="block pt-1 pb-2 text-xs text-white">
                            You can change it at any time.
                        </small>
                        <input 
                        id="title"
                        type="text" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full h-10 px-2 rounded-sm focus:outline-none" />
                        <small className="text-xs text-red-500"> { errors.title } </small>
                    </div>
                    <div className="mt-4">
                        <label 
                        className="text-white text-md"
                        htmlFor="desc">
                            Description
                        </label>
                        <small className="block pt-1 pb-2 text-xs text-white">
                            Describe your sub
                        </small>
                        <textarea 
                        id="desc"
                        value={ description }
                        onChange={e => setDescription(e.target.value)}
                        className="w-full h-20 px-2 rounded-sm focus:outline-none" />
                        <small className="text-xs text-red-500"> { errors.description } </small>
                    </div>
                    <div className="mt-4">
                        <button 
                        type="submit"
                        className="flex items-center justify-center w-8/12 ml-auto button blue">
                            Create
                        </button>
                    </div>
                    
                    </form>
                </div>
                <div className="hidden w-6/12 lg:block">
                <h1 className="mr-4 text-6xl text-center text-white">
                {subName}: Update
                </h1>
                </div>
            </div>
        </div>
        </>
    )
}

export const getServerSideProps : GetServerSideProps = async (props) => {    
    try {
        const cookie = props.req.headers.cookie
        const subName = props.query.slug;
        if(!cookie) throw new Error('Missing auth token cookie')

        const {data: user}  = await Axios.get<User>('/auth/me', {headers: { cookie }})
        const {data: sub} = await Axios.get<Sub>(`/subs/${subName}`)
        
        if(user.username != sub.username) throw new Error('You are not owner of this sub')

        return { props: {} }
    } catch (err) {
        props.res.writeHead(307, { location: '/' }).end()
    }
}