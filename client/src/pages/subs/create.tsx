import Axios from "axios"
import { useRouter } from "next/router"
import Head from "next/head"
import { FormEvent, useState } from "react"
import { GetServerSideProps } from "next"

export default function create() {
    const [name, setName] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    
    const [errors, setErrors] = useState<Partial<any>>({})

    const router = useRouter()
    const submitForm = async (event: FormEvent) => {
        event.preventDefault()

        try {
            const res = await Axios.post('/subs', { name, title, description })

            router.push(`/s/${res.data.name}`)
        } catch (err) {
            console.log(err)
            setErrors(err.response.data)
        }
    }

    return (
        <>
        <Head>
            <title> Create a sub </title>
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
                        Create a Sub
                    </h1>
                    <div>
                        <label 
                        className="text-white text-md"
                        htmlFor="name">
                            Name
                        </label>
                        <small className="block pt-1 pb-2 text-xs text-white">
                            Sub names cannot be changed once you created it
                        </small>
                        <input 
                        id="name"
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full h-10 px-2 rounded-sm focus:outline-none" />
                        <small className="text-xs text-red-500"> { errors.name } </small>
                    </div>
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
                    Create a Sub
                </h1>
                </div>
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