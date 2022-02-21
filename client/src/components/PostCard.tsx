import Link from 'next/link'
import { Post } from '../types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Axios from 'axios'
import classNames from 'classnames'
import { useRouter } from 'next/router'
import OwnerComponent from './OwnerComponent'
import { MouseEventHandler } from 'react'
import ReactDOM from 'react-dom'


interface PostCardProps {
    post: Post,
    revalidate?: Function
}

dayjs.extend(relativeTime)

const ActionButton = ({ children }) => {
    return <div className="w-auto px-2 py-2 text-xs rounded-md cursor-pointer hover:bg-gray-700">
            {children}
            </div>
}

export default function PostCard( {post, revalidate}: PostCardProps ) {
    const router = useRouter()
    const isInSubPage = router.pathname === '/s/[sub]'
    
    const vote = async (value) => {
        if(value === post.userVote) value = 0
        try {
            const res = await Axios.post('/misc/vote', {
                identifier: post.identifier,
                slug: post.slug,
                value
            })
        if(revalidate) revalidate()
        console.log(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    const deletePost = async () => {
      await Axios.post('/posts/destroy', {
        identifier: post.identifier,
        slug: post.slug
      })
      if(revalidate) revalidate()
    }

    const CopyClipboard = (url:string) => {
      const postFullUrl = `${window.location.host}${url}`
      navigator.clipboard.writeText(postFullUrl)
      const notify = `<div class="fixed bottom-3 right-4 p-4 rounded-md text-sm bg-white" id="notify-clipboard">
      Copied to clipboard
      </div>`
      //alert("Copied the text: " + postFullUrl)
      document.body.insertAdjacentHTML('beforeend', notify)
      setTimeout(function(){ document.getElementById('notify-clipboard').remove() }, 2000);
    }

    return (
        <div className="flex flex-row w-full h-full mb-3 bg-gray-500 rounded-md " key={post.identifier}>
              
              <div className="px-1 py-2 text-center bg-gray-600 shadow-sm rounded-tl-md rounded-bl-md w-14">
                {/* upVote */}
                <div 
                className={classNames("w-full py-1 mb-2 text-base text-center text-white rounded-sm cursor-pointer hover:bg-gray-700 hover:text-green-400",{
                    "text-green-400" : post.userVote === 1
                })}
                onClick={(e) => {
                    vote(1)
                    var downvote = e.currentTarget.parentNode.querySelectorAll("div.text-red-400");
                    if(downvote.length > 0) downvote[0].classList.remove("text-red-400")
                    e.currentTarget.classList.add("text-green-400")
                } }>
                <i className="fas fa-chevron-up"></i>
                </div>
                <p className="text-xs font-bold">{ post.voteScore }</p>
                {/* downVote */}
                <div 
                className={classNames("w-full py-1 text-base text-center text-white rounded-sm cursor-pointer hover:bg-gray-700 hover:text-red-400",{
                    "text-red-400" : post.userVote === -1
                })}
                onClick={(e) => {
                    vote(-1)
                    var upvote = e.currentTarget.parentNode.querySelectorAll("div.text-green-400");
                    if(upvote.length > 0) upvote[0].classList.remove("text-green-400")
                    e.currentTarget.classList.add("text-red-400")
                }}>
                <i className="fas fa-chevron-down"></i>
                </div>
              </div>
              
              <div className="w-full px-3 py-2">
                
                <div className="relative flex items-center justify-start w-full mb-2">
                  { !isInSubPage && (
                    <>
                    <Link href={`/s/${post.subName}`}>
                    <a className="flex items-center">
                    <img 
                    src={post.sub.imageUrl}
                    className="inline w-auto rounded-full cursor-pointer max-h-6" />
                    <span className="inline ml-2 text-sm font-bold tracking-widest cursor-pointer hover:underline">
                      {post.subName}
                    </span>
                    </a>
                  </Link>
                    </>
                  )}
                                    
                  <div className={`flex items-center ${!isInSubPage && ('ml-2')} text-gray-200`}>
                    <i className="mr-1 text-gray-800 fas fa-caret-right"></i>
                    <Link href={`/u/${post.username}`}>
                      <a className="text-xs cursor-pointer hover:underline">Posted by {post.username} </a>
                    </Link>
                    <Link href={post.url}>
                      <a className="ml-2 text-xs cursor-pointer hover:underline">
                        {dayjs(post.createdAt).fromNow()}
                      </a>
                    </Link>
                  </div>
                  <OwnerComponent username={post.username}>
                    <div 
                    onClick={e => {
                      let menu = e.currentTarget.querySelectorAll("div.absolute")[0];
                      menu.classList.toggle('hidden')
                    }}
                    className="absolute top-0 bottom-0 right-0 flex items-center justify-center px-3 rounded-sm cursor-pointer hover:text-green-500 hover:bg-gray-600">
                    <i className="fas fa-chevron-down"></i>
                    <div 
                    className="absolute right-0 hidden p-1 text-gray-900 bg-white rounded-sm w-44" 
                    style={{ top:'100%', zIndex:99 }}>
                      <ul>
                      <li className="px-4 py-2 text-sm rounded-sm hover:text-white hover:bg-gray-500">
                          <Link href={`/e/${post.identifier}/${post.slug}`}>
                            <a>
                            Edit Post
                            </a>
                          </Link>
                        </li>
                        <li className="px-4 py-2 text-sm rounded-sm hover:text-white hover:bg-gray-500">                          
                            <a onClick={deletePost}>
                            Delete Post
                            </a>
                        </li>
                      </ul>
                    </div>
                    </div>
                  </OwnerComponent>
                </div>

                
                <Link href={post.url}>
                  <a className="flex mb-2 text-lg leading-6 text-white cursor-pointer hover:underline">{post.title}</a>
                </Link>
                
                <div className="mb-3 text-sm text-left text-gray-100 pcardin" dangerouslySetInnerHTML={{ __html: post.body }}>   
                </div>

                
                <div className="flex items-center justify-start w-full text-gray-200">
                  <Link href={post.url}>
                    <><ActionButton>
                      <i className="mr-1 fas fa-comment-alt"></i>
                      { post.commentCount } Comments
                    </ActionButton></>
                  </Link>
                  <Link href="#">
                    <><ActionButton>
                      <div onClick={() => CopyClipboard(post.url)}>
                      <i className="mr-1 fas fa-share"></i>
                      Share
                      </div>
                    </ActionButton></>
                  </Link>
                  <Link href="#">
                    <div className="hidden"><ActionButton>
                      <i className="mr-1 fas fa-bookmark"></i>
                      Save
                    </ActionButton></div>
                  </Link>
                </div>
              </div>
            </div>
    )
}
