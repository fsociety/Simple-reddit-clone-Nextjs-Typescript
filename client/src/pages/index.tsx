import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import useSWR, { useSWRInfinite } from 'swr'

import { Post, Sub } from '../types'

import PostCard from '../components/PostCard'
import { useAuthState } from '../context/auth'
import { useEffect } from 'react'

dayjs.extend(relativeTime)

export default function Home() {
  const { authenticated } = useAuthState()
  //const { data: posts } = useSWR('/posts')
  const { data: topSubs } = useSWR('/misc/top-subs')

  const { data, error, mutate, size, setSize, isValidating, revalidate } = useSWRInfinite<Post[]>(
    index =>
      `/posts?page=${index}`
  );
  const posts = data ? [].concat(...data) : [];
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < 5);

  useEffect(() => {
    window.onscroll = function(ev: any) {
      if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
        if(!isReachingEnd) setSize( size + 1 )
      }
  };
  }, [data])

  return (
    <div>
      <Head>
        <title>Quinlan: Home</title>
      </Head>
      <div className="container flex justify-center h-full pt-2">
        {/* Posts Container */}
        <div className="w-full h-full px-2 md:w-4/6 text-gray-50 md:px-0">
          
            {posts?.map(post => (
              <PostCard post={post} key={post.identifier} revalidate={revalidate} />
            ))}

        </div>
        <div className="hidden h-full px-2 md:block md:w-2/6">
              <div className="w-full bg-gray-500 rounded-md">
                <h1 className="py-3 text-lg font-medium text-center text-white">
                  Top Communities
                </h1>                
                <div className="w-full pb-1">
                  <ul>
                    {topSubs?.map((topsub : Sub) => (

                      <li 
                      key={topsub.name}
                      className="flex items-center justify-between px-2 py-2 border-t border-gray-400">
                      <Link href={`/s/${topsub.name}`}>
                        <a className="flex items-center justify-start font-medium text-white">
                        <Image
                        src={topsub.imageUrl}
                        className="rounded-full"
                        width={34}
                        height={34}
                        />
                        <p className="ml-1">
                          {topsub.title}
                        </p>                         
                        </a>
                      </Link>
                      <span className="text-sm text-white">
                      {topsub.postCount}
                      </span>
                      </li>

                      ))}                   
                    
                  </ul>
                </div>
              </div>
              {authenticated && (
                <div className="w-full py-2">
                <Link href="/subs/create">
                  <a className="flex justify-center w-full button blue">
                    Create Sub
                  </a>
                </Link>
                </div>
              )}
        </div>
      </div>
    </div>
  )
}
