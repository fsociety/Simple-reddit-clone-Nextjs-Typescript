import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import useSWR from "swr";
import { Post, Comment } from "../../../../types";
import Sidebar from '../../../../components/Sidebar'
import PostCard from '../../../../components/PostCard'
import CommentCard from '../../../../components/CommentCard'
import { useAuthState } from '../../../../context/auth'
import { FormEvent, useState } from "react";
import Axios from "axios";

export default function PostPage() {
    const router = useRouter()
    const { identifier, sub, slug } = router.query
    const [newComment, setNewComment] = useState('')
    const { authenticated } = useAuthState()
    
    const { data: post, error } = useSWR<Post>((identifier && slug) ? `/posts/${identifier}/${slug}` : null)

    const { data: comments, revalidate } = useSWR<Comment[]>((identifier && slug) ? `/posts/${identifier}/${slug}/comments` : null)

    if(error) router.push('/')

    const submitComment = async (event: FormEvent) => {
        event.preventDefault()
        if(newComment.trim() === '') return

        try {
            await Axios.post(`/posts/${post.identifier}/${post.slug}/comments`, {
                body: newComment
            })
            setNewComment('')
            revalidate()
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <>
        <Head>
            <title> { post?.title } </title>
        </Head>
        <div className="flex items-end w-full h-32 bg-gradient-to-r from-green-400 to-blue-500"
        style={ post && post.sub.bannerUrl ? {
            backgroundImage: `url(${post.sub.bannerUrl})`,
            backgroundRepeat:'no-repeat',
            backgroundSize:'cover',
            backgroundPosition: 'center'
            } : null }>
            <div className="container">
                {post && (
                    <div className="flex items-end">
                    <div className="flex items-center">
                        <Image 
                        src={post.sub.imageUrl}
                        className="rounded-full"
                        alt=""
                        width={70}
                        height={70}
                        />
                    </div>
                    <div className="flex flex-col items-start justify-center pb-1 ml-2 text-white">
                        <span className="text-sm font-medium">
                            <i className="mr-1 text-gray-300 fas fa-caret-right"></i> { post.sub.name }
                        </span>
                        <h1 className="text-4xl font-bold"> { post.sub.title } </h1>
                        <p className="text-base font-normal text-gray-50">
                            { post.sub.description }
                        </p>
                    </div>
                    </div>
                )}
            
            </div>
        </div>
        <div className="container flex justify-start h-full pt-4 mb-36">

        <div className="w-full h-full md:w-4/6 text-gray-50">            
            {post && (
                  <PostCard post={post} key={post.identifier} />
              )}
            { authenticated && (
                <div className="w-full pb-1">
                <form onSubmit={submitComment} className="relative flex flex-col items-end w-full">
                <textarea 
                className="w-full h-24 p-2 bg-gray-700 rounded-sm outline-none text-gray-50" 
                placeholder="Comment..."
                onChange={(e) => setNewComment(e.target.value)}
                value={newComment}>                    
                </textarea>
                <button 
                style={{ width:45,height:45 }}
                className="absolute text-center transition-all duration-200 ease-in-out bg-gray-600 rounded-full right-1 bottom-1 hover:bg-blue-500 focus:outline-none" 
                type="submit">
                    <i className="fas fa-paper-plane"></i>
                </button>
                </form>
            </div>
            )}
            
            {/* Comments */}
            <div className="w-full bg-gray-500 rounded-md">
                    {/* Comment */} 
                {comments?.map(comment => (
                    <CommentCard comment={comment} post={post} key={comment.identifier} />
                ))}
            </div>
        </div>
        
        <div className="hidden h-full px-2 md:block md:w-2/6">
              {post && (
                  <Sidebar sub={post.sub} />
              )}
        </div>

        </div>
        </>
    )
}
