import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import {
  PhotoIcon,
  VideoCameraIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline'

export default function PostForm({ onPostCreated }) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      setSelectedVideo(null)
    }
  }

  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file)
      setSelectedImage(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && !selectedImage && !selectedVideo) return

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('content', content)
      if (selectedImage) formData.append('image', selectedImage)
      if (selectedVideo) formData.append('video', selectedVideo)

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const newPost = await response.json()
        onPostCreated(newPost)
        setContent('')
        setSelectedImage(null)
        setSelectedVideo(null)
      }
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="post-container mb-6">
      <div className="flex items-start space-x-3">
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        )}
        
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${session?.user?.name?.split(' ')[0]}?`}
              className="w-full p-3 border-none resize-none bg-facebook-light rounded-3xl focus:outline-none focus:ring-2 focus:ring-facebook-blue"
              rows="3"
            />
            
            {selectedImage && (
              <div className="mt-3 relative">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected"
                  className="max-w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700"
                >
                  ✕
                </button>
              </div>
            )}
            
            {selectedVideo && (
              <div className="mt-3 relative">
                <video
                  src={URL.createObjectURL(selectedVideo)}
                  controls
                  className="max-w-full h-64 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700"
                >
                  ✕
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <div className="flex space-x-4">
                <label className="flex items-center space-x-1 cursor-pointer text-facebook-gray hover:bg-facebook-light p-2 rounded-lg">
                  <PhotoIcon className="h-6 w-6 text-green-500" />
                  <span className="text-sm">Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                
                <label className="flex items-center space-x-1 cursor-pointer text-facebook-gray hover:bg-facebook-light p-2 rounded-lg">
                  <VideoCameraIcon className="h-6 w-6 text-red-500" />
                  <span className="text-sm">Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </label>
                
                <button
                  type="button"
                  className="flex items-center space-x-1 text-facebook-gray hover:bg-facebook-light p-2 rounded-lg"
                >
                  <FaceSmileIcon className="h-6 w-6 text-yellow-500" />
                  <span className="text-sm">Feeling</span>
                </button>
              </div>
              
              <button
                type="submit"
                disabled={(!content.trim() && !selectedImage && !selectedVideo) || isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}