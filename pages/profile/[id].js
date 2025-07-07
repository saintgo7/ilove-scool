import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Layout from '../../components/Layout'
import PostCard from '../../components/PostCard'
import PostForm from '../../components/PostForm'
import { prisma } from '../../lib/prisma'
import {
  PlusIcon,
  CameraIcon,
  UserPlusIcon,
  UserMinusIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

export default function Profile({ profileUser, posts, friendship }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [userPosts, setUserPosts] = useState(posts)
  const [friendshipStatus, setFriendshipStatus] = useState(friendship?.status)
  const [isOwner] = useState(session?.user?.id === profileUser?.id)

  const handleFriendAction = async (action) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          targetUserId: profileUser.id,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setFriendshipStatus(result.status)
      }
    } catch (error) {
      console.error('Error handling friend action:', error)
    }
  }

  const getFriendButtonText = () => {
    if (isOwner) return null
    
    switch (friendshipStatus) {
      case 'accepted':
        return 'Friends'
      case 'pending':
        return 'Request Sent'
      case 'blocked':
        return 'Blocked'
      default:
        return 'Add Friend'
    }
  }

  const getFriendButtonAction = () => {
    switch (friendshipStatus) {
      case 'accepted':
        return 'unfriend'
      case 'pending':
        return 'cancel'
      default:
        return 'request'
    }
  }

  if (!profileUser) {
    return (
      <Layout>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>{profileUser.name} - Facebook Clone</title>
        <meta name="description" content={`${profileUser.name}'s profile`} />
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          {/* Cover Photo */}
          <div className="relative h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-lg overflow-hidden">
            {profileUser.coverImage ? (
              <Image
                src={profileUser.coverImage}
                alt="Cover"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
            )}
            
            {isOwner && (
              <button className="absolute bottom-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-lg flex items-center space-x-2">
                <CameraIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Edit Cover Photo</span>
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-20 mb-4">
              {/* Profile Picture */}
              <div className="relative">
                {profileUser.image ? (
                  <Image
                    src={profileUser.image}
                    alt={profileUser.name}
                    width={160}
                    height={160}
                    className="rounded-full border-4 border-white bg-white"
                  />
                ) : (
                  <div className="w-40 h-40 bg-gray-300 rounded-full border-4 border-white"></div>
                )}
                
                {isOwner && (
                  <button className="absolute bottom-2 right-2 bg-facebook-light hover:bg-gray-300 p-2 rounded-full">
                    <CameraIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Profile Actions */}
              <div className="ml-auto flex items-center space-x-3 mb-4">
                {!isOwner && (
                  <>
                    <button
                      onClick={() => handleFriendAction(getFriendButtonAction())}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                        friendshipStatus === 'accepted'
                          ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          : 'btn-primary'
                      }`}
                    >
                      {friendshipStatus === 'accepted' ? (
                        <UserMinusIcon className="h-5 w-5" />
                      ) : (
                        <UserPlusIcon className="h-5 w-5" />
                      )}
                      <span>{getFriendButtonText()}</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 btn-secondary">
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                      <span>Message</span>
                    </button>
                  </>
                )}
                
                {isOwner && (
                  <button className="flex items-center space-x-2 btn-secondary">
                    <PlusIcon className="h-5 w-5" />
                    <span>Add to Story</span>
                  </button>
                )}
              </div>
            </div>

            {/* User Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileUser.name}</h1>
              
              {profileUser.bio && (
                <p className="text-gray-600 mb-3">{profileUser.bio}</p>
              )}
              
              <div className="flex items-center text-gray-500 text-sm space-x-4">
                <span>{profileUser._count?.friendships || 0} friends</span>
                <span>{userPosts.length} posts</span>
                {profileUser.location && <span>📍 {profileUser.location}</span>}
                {profileUser.website && (
                  <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    🌐 Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - About */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              
              <div className="space-y-3">
                {profileUser.bio && (
                  <div>
                    <h3 className="font-medium text-gray-900">Bio</h3>
                    <p className="text-gray-600">{profileUser.bio}</p>
                  </div>
                )}
                
                {profileUser.location && (
                  <div>
                    <h3 className="font-medium text-gray-900">Lives in</h3>
                    <p className="text-gray-600">{profileUser.location}</p>
                  </div>
                )}
                
                {profileUser.birthDate && (
                  <div>
                    <h3 className="font-medium text-gray-900">Birth Date</h3>
                    <p className="text-gray-600">
                      {new Date(profileUser.birthDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-gray-900">Joined</h3>
                  <p className="text-gray-600">
                    {new Date(profileUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Friends Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Friends</h2>
                <button className="text-blue-600 hover:underline text-sm">See all</button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {/* This would show actual friends in a real implementation */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Posts */}
          <div className="lg:col-span-2">
            {/* Post Form (only for profile owner) */}
            {isOwner && (
              <PostForm onPostCreated={(newPost) => setUserPosts([newPost, ...userPosts])} />
            )}

            {/* Posts */}
            <div className="space-y-4">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No posts yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps({ params }) {
  const { id } = params

  try {
    const profileUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            friendships: true,
            posts: true,
          },
        },
      },
    })

    if (!profileUser) {
      return {
        notFound: true,
      }
    }

    const posts = await prisma.post.findMany({
      where: { authorId: id },
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
    })

    return {
      props: {
        profileUser: JSON.parse(JSON.stringify(profileUser)),
        posts: JSON.parse(JSON.stringify(posts)),
        friendship: null, // This would be populated based on the current user's relationship
      },
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return {
      notFound: true,
    }
  }
}