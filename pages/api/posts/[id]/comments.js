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
      const { content } = req.body

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Comment content is required' })
      }

      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: postId },
      })

      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      // Create comment
      const comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          authorId: session.user.id,
          postId: postId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      // Create notification for post author (if not self-comment)
      if (post.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            type: 'comment',
            content: `${session.user.name} commented on your post`,
            userId: post.authorId,
            postId: postId,
            fromUserId: session.user.id,
          },
        })
      }

      res.status(201).json(comment)
    } catch (error) {
      console.error('Error creating comment:', error)
      res.status(500).json({ error: 'Failed to create comment' })
    }
  } else if (req.method === 'GET') {
    try {
      const comments = await prisma.comment.findMany({
        where: { postId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      res.status(200).json(comments)
    } catch (error) {
      console.error('Error fetching comments:', error)
      res.status(500).json({ error: 'Failed to fetch comments' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}