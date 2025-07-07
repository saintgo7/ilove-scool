import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          user: {
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
        take: 50,
      })

      res.status(200).json(notifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      res.status(500).json({ error: 'Failed to fetch notifications' })
    }
  } else if (req.method === 'PATCH') {
    try {
      const { notificationId, markAsRead } = req.body

      if (notificationId) {
        // Mark specific notification as read
        const notification = await prisma.notification.update({
          where: {
            id: notificationId,
            userId: session.user.id,
          },
          data: {
            read: markAsRead,
          },
        })

        res.status(200).json(notification)
      } else {
        // Mark all notifications as read
        await prisma.notification.updateMany({
          where: {
            userId: session.user.id,
            read: false,
          },
          data: {
            read: true,
          },
        })

        res.status(200).json({ success: true })
      }
    } catch (error) {
      console.error('Error updating notifications:', error)
      res.status(500).json({ error: 'Failed to update notifications' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}