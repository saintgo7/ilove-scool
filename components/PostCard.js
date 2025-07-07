import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

export default function PostCard({ post }) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(
    post.likes?.some(like => like.user.id === session?.user?.id) || false
  )
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState(post.comments || [])

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: liked ? 'DELETE' : 'POST',
      })

      if (response.ok) {
        setLiked(!liked)
        setLikeCount(prev => liked ? prev - 1 : prev + 1)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        const comment = await response.json()
        setComments([...comments, comment])
        setNewComment('')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`
    return date.toLocaleDateString()
  }

  return (
    <div className="post-container">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link href={`/profile/${post.author.id}`}>
            {post.author.image ? (
              <Image
                src={post.author.image}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full hover:opacity-90"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            )}
          </Link>
          
          <div>
            <Link href={`/profile/${post.author.id}`} className="font-semibold text-facebook-dark hover:underline">
              {post.author.name}
            </Link>
            <p className="text-sm text-facebook-gray">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        
        <button className="p-2 hover:bg-facebook-light rounded-full">
          <EllipsisHorizontalIcon className="h-5 w-5 text-facebook-gray" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-facebook-dark whitespace-pre-wrap">{post.content}</p>
        
        {post.image && (
          <div className="mt-3">
            <img
              src={post.image}
              alt="Post content"
              className="w-full rounded-lg max-h-96 object-cover"
            />
          </div>
        )}
        
        {post.video && (
          <div className="mt-3">
            <video
              src={post.video}
              controls
              className="w-full rounded-lg max-h-96"
            />
          </div>
        )}
      </div>

      {/* Post Stats */}
      {(likeCount > 0 || comments.length > 0) && (
        <div className="flex items-center justify-between py-2 border-b border-gray-200 mb-3">
          <div className="flex items-center space-x-1">
            {likeCount > 0 && (
              <>
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 bg-facebook-blue rounded-full flex items-center justify-center">
                    <HeartSolidIcon className="w-3 h-3 text-white" />
                  </div>
                </div>
                <span className="text-sm text-facebook-gray ml-2">{likeCount}</span>
              </>
            )}
          </div>
          
          {comments.length > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-sm text-facebook-gray hover:underline"
            >
              {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-around py-2 border-b border-gray-200 mb-3">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-facebook-light transition-colors ${
            liked ? 'text-red-500' : 'text-facebook-gray'
          }`}
        >
          {liked ? (
            <HeartSolidIcon className="h-5 w-5" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">Like</span>
        </button>
        
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-facebook-light text-facebook-gray transition-colors"
        >
          <ChatBubbleLeftIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Comment</span>
        </button>
        
        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-facebook-light text-facebook-gray transition-colors">
          <ShareIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-3">
          {/* Existing Comments */}
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-2">
              {comment.author.image ? (
                <Image
                  src={comment.author.image}
                  alt={comment.author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              )}
              
              <div className="flex-1">
                <div className="bg-facebook-light rounded-2xl px-3 py-2">
                  <p className="font-semibold text-sm">{comment.author.name}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
                <div className="flex items-center space-x-4 mt-1 px-3">
                  <span className="text-xs text-facebook-gray">{formatDate(comment.createdAt)}</span>
                  <button className="text-xs text-facebook-gray hover:underline">Like</button>
                  <button className="text-xs text-facebook-gray hover:underline">Reply</button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Comment */}
          <form onSubmit={handleComment} className="flex items-start space-x-2">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            )}
            
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 bg-facebook-light rounded-2xl focus:outline-none focus:ring-2 focus:ring-facebook-blue"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="text-facebook-blue font-medium disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}