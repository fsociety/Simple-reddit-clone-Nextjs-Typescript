import React from 'react'
import Image from "next/image";
import Link from "next/link";
import { Comment, Post } from '../types';
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Axios from 'axios'
import classNames from 'classnames'

interface CommentProp{
    comment : Comment
    post: Post
}

dayjs.extend(relativeTime)

export default function CommentCard({comment, post} : CommentProp) {

    const vote = async (value: number, comment: Comment) => {
        if(comment.userVote === value) value = 0
        try {
            const res = await Axios.post('/misc/vote', {
                identifier: post.identifier,
                slug: post.slug,
                commentIdentifier: comment.identifier,
                value
            })
        console.log(res.data)
        } catch (err) {
            console.log(err)
        }
    }
    
    return (
        <>
        <div className="flex flex-col items-start justify-between w-full px-3 py-4 border-t border-gray-400 rounded-t-md">
        <div className="flex items-center justify-start mb-2">
            <Image 
            src="http://localhost:3000/images/default-sub-image-q.png"
            className="rounded-full"
            width={30}
            height={30}
            />
            <Link href={`/u/${comment.username}`}>
            <a className="ml-2 text-sm cursor-pointer hover:underline">{ comment.username }</a>
            </Link>
            <span className="ml-2 text-xs cursor-pointer hover:underline">{dayjs(comment.createdAt).fromNow()}</span>
        </div>
        <div className="py-1 pl-1 mb-3 text-sm text-left text-gray-300">
        {comment.body}
        </div>
        <div className="flex items-center justify-start w-full pl-2 font-bold text-gray-200">
            <div>
            <i className={classNames("mr-2 text-xs cursor-pointer hover:text-green-400 fas fa-chevron-up", {
                "text-green-400" : comment.userVote === 1
            })}
            onClick={(e) => {
                vote(1, comment)
                var downvote = e.currentTarget.parentNode.querySelectorAll("i.text-red-400");
                var voteScore = e.currentTarget.parentNode.querySelectorAll("span#voteScore")[0]
                if(downvote.length > 0) downvote[0].classList.remove("text-red-400")
                e.currentTarget.classList.add("text-green-400")
            } }></i>
            <span className="text-xs" id="voteScore"> {comment.voteScore} </span>
            <i className={classNames("ml-2 text-xs cursor-pointer hover:text-red-400 fas fa-chevron-down",{
               "text-red-400" : comment.userVote === -1
            })}
            onClick={(e) => {
                vote(-1, comment)
                var upvote = e.currentTarget.parentNode.querySelectorAll("i.text-green-400");
                var voteScore = e.currentTarget.parentNode.querySelectorAll("span#voteScore")[0]
                if(upvote.length > 0) upvote[0].classList.remove("text-green-400")
                e.currentTarget.classList.add("text-red-400")
            }}></i>
            </div>
            <div className="p-2 ml-4 text-xs rounded-md cursor-pointer hover:bg-gray-700">
            <i className="fas fa-reply"></i>&nbsp;Reply
            </div>
        </div>
        </div>
        </>
    )
}
