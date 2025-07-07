import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { prisma } from '../../../../lib/prisma'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id: postId } = req.query

  if (req.method === 'POST') {
    try {
      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: postId },
      })

      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      // Check if user already liked the post
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: postId,
          },
        },
      })

      if (existingLike) {
        return res.status(400).json({ error: 'Post already liked' })
      }

      // Create like
      const like = await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: postId,
        },
      })

      // Create notification for post author (if not self-like)
      if (post.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            type: 'like',
            content: `${session.user.name} liked your post`,
            userId: post.authorId,
            postId: postId,
            fromUserId: session.user.id,
          },
        })
      }

      res.status(201).json({ success: true, like })
    } catch (error) {
      console.error('Error liking post:', error)
      res.status(500).json({ error: 'Failed to like post' })
    }
  } else if (req.method === 'DELETE') {
    try {
      // Check if like exists
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: postId,
          },
        },
      })

      if (!existingLike) {
        return res.status(404).json({ error: 'Like not found' })
      }

      // Delete like
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: postId,
          },
        },
      })

      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error unliking post:', error)
      res.status(500).json({ error: 'Failed to unlike post' })
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}