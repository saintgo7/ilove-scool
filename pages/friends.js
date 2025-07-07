import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '../components/Layout'
import { prisma } from '../lib/prisma'
import {
  UserPlusIcon,
  UserMinusIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export default function Friends({ friendRequests: initialRequests, suggestions }) {
  const { data: session } = useSession()
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState(initialRequests)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends')
      if (response.ok) {
        const data = await response.json()
        setFriends(data)
      }
    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFriendAction = async (action, targetUserId) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          targetUserId,
        }),
      })

      if (response.ok) {
        // Refresh data
        if (action === 'accept' || action === 'decline') {
          setFriendRequests(prev => prev.filter(req => req.requester.id !== targetUserId))
        }
        
        if (action === 'accept') {
          fetchFriends()
        }
        
        if (action === 'unfriend') {
          setFriends(prev => prev.filter(friend => friend.id !== targetUserId))
        }
      }
    } catch (error) {
      console.error('Error handling friend action:', error)
    }
  }

  if (!session) {
    return (
      <Layout>
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view friends.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Friends - Facebook Clone</title>
        <meta name="description" content="Manage your friends and friend requests" />
      </Head>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Friends</h1>

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Friend Requests ({friendRequests.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friendRequests.map((request) => (
                <div key={request.id} className="card">
                  <div className="text-center">
                    <Link href={`/profile/${request.requester.id}`}>
                      {request.requester.image ? (
                        <Image
                          src={request.requester.image}
                          alt={request.requester.name}
                          width={80}
                          height={80}
                          className="rounded-full mx-auto mb-3 hover:opacity-90"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3"></div>
                      )}
                    </Link>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">
                      <Link href={`/profile/${request.requester.id}`} className="hover:underline">
                        {request.requester.name}
                      </Link>
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleFriendAction('accept', request.requester.id)}
                        className="flex-1 flex items-center justify-center space-x-1 btn-primary text-sm py-2"
                      >
                        <CheckIcon className="h-4 w-4" />
                        <span>Accept</span>
                      </button>
                      
                      <button
                        onClick={() => handleFriendAction('decline', request.requester.id)}
                        className="flex-1 flex items-center justify-center space-x-1 btn-secondary text-sm py-2"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Friends */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              All Friends ({friends.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div key={friend.id} className="card">
                  <div className="text-center">
                    <Link href={`/profile/${friend.id}`}>
                      {friend.image ? (
                        <Image
                          src={friend.image}
                          alt={friend.name}
                          width={80}
                          height={80}
                          className="rounded-full mx-auto mb-3 hover:opacity-90"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3"></div>
                      )}
                    </Link>
                    
                    <h3 className="font-semibold text-gray-900 mb-4">
                      <Link href={`/profile/${friend.id}`} className="hover:underline">
                        {friend.name}
                      </Link>
                    </h3>
                    
                    <button
                      onClick={() => handleFriendAction('unfriend', friend.id)}
                      className="flex items-center justify-center space-x-1 btn-secondary w-full text-sm py-2"
                    >
                      <UserMinusIcon className="h-4 w-4" />
                      <span>Unfriend</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No friends yet. Start connecting with people!</p>
            </div>
          )}
        </div>

        {/* Friend Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              People You May Know
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="card">
                  <div className="text-center">
                    <Link href={`/profile/${suggestion.id}`}>
                      {suggestion.image ? (
                        <Image
                          src={suggestion.image}
                          alt={suggestion.name}
                          width={80}
                          height={80}
                          className="rounded-full mx-auto mb-3 hover:opacity-90"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3"></div>
                      )}
                    </Link>
                    
                    <h3 className="font-semibold text-gray-900 mb-4">
                      <Link href={`/profile/${suggestion.id}`} className="hover:underline">
                        {suggestion.name}
                      </Link>
                    </h3>
                    
                    <button
                      onClick={() => handleFriendAction('request', suggestion.id)}
                      className="flex items-center justify-center space-x-1 btn-primary w-full text-sm py-2"
                    >
                      <UserPlusIcon className="h-4 w-4" />
                      <span>Add Friend</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getServerSideProps({ req }) {
  try {
    // Get friend requests
    const friendRequests = await prisma.friendship.findMany({
      where: {
        status: 'pending',
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get friend suggestions (random users for demo)
    const suggestions = await prisma.user.findMany({
      take: 6,
      select: {
        id: true,
        name: true,
        image: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      props: {
        friendRequests: JSON.parse(JSON.stringify(friendRequests)),
        suggestions: JSON.parse(JSON.stringify(suggestions)),
      },
    }
  } catch (error) {
    console.error('Error fetching friends data:', error)
    return {
      props: {
        friendRequests: [],
        suggestions: [],
      },
    }
  }
}