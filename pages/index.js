import { useSession, signIn, signOut } from 'next-auth/react'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import PostForm from '../components/PostForm'
import PostCard from '../components/PostCard'
import { prisma } from '../lib/prisma'

export default function Home({ posts }) {
  const { data: session, status } = useSession()
  const [feedPosts, setFeedPosts] = useState(posts)

  if (status === 'loading') return <div className="flex justify-center items-center h-screen">Loading...</div>

  if (!session) {
    return (
      <div className="min-h-screen bg-facebook-light flex flex-col items-center justify-center">
        <Head>
          <title>Facebook Clone</title>
          <meta name="description" content="A modern Facebook clone built with Next.js" />
        </Head>
        
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-facebook-blue mb-2">Facebook Clone</h1>
            <p className="text-facebook-gray">Connect with friends and the world around you</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => signIn('google')}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign in with Google
            </button>
            
            <button
              onClick={() => signIn('facebook')}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-facebook-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in with Facebook
            </button>
            
            <button
              onClick={() => signIn('apple')}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Sign in with Apple
            </button>
            
            <button
              onClick={() => signIn('naver')}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Sign in with Naver
            </button>
            
            <button
              onClick={() => signIn('kakao')}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Sign in with Kakao
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Facebook Clone - Home</title>
        <meta name="description" content="Your social media home" />
      </Head>
      
      <div className="max-w-2xl mx-auto">
        <PostForm onPostCreated={(newPost) => setFeedPosts([newPost, ...feedPosts])} />
        
        <div className="space-y-4">
          {feedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      likes: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  })

  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
    },
  }
}