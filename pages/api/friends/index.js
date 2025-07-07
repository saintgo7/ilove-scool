import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    try {
      const { action, targetUserId } = req.body

      if (!targetUserId) {
        return res.status(400).json({ error: 'Target user ID is required' })
      }

      if (targetUserId === session.user.id) {
        return res.status(400).json({ error: 'Cannot perform this action on yourself' })
      }

      switch (action) {
        case 'request':
          // Send friend request
          const existingFriendship = await prisma.friendship.findFirst({
            where: {
              OR: [
                { requesterId: session.user.id, addresseeId: targetUserId },
                { requesterId: targetUserId, addresseeId: session.user.id },
              ],
            },
          })

          if (existingFriendship) {
            return res.status(400).json({ error: 'Friendship already exists' })
          }

          const friendship = await prisma.friendship.create({
            data: {
              requesterId: session.user.id,
              addresseeId: targetUserId,
              status: 'pending',
            },
          })

          // Create notification
          await prisma.notification.create({
            data: {
              type: 'friend_request',
              content: `${session.user.name} sent you a friend request`,
              userId: targetUserId,
              fromUserId: session.user.id,
            },
          })

          res.status(201).json({ status: 'pending', friendship })
          break

        case 'accept':
          // Accept friend request
          const pendingRequest = await prisma.friendship.findFirst({
            where: {
              requesterId: targetUserId,
              addresseeId: session.user.id,
              status: 'pending',
            },
          })

          if (!pendingRequest) {
            return res.status(404).json({ error: 'Friend request not found' })
          }

          const acceptedFriendship = await prisma.friendship.update({
            where: { id: pendingRequest.id },
            data: { status: 'accepted' },
          })

          // Create notification
          await prisma.notification.create({
            data: {
              type: 'friend_accept',
              content: `${session.user.name} accepted your friend request`,
              userId: targetUserId,
              fromUserId: session.user.id,
            },
          })

          res.status(200).json({ status: 'accepted', friendship: acceptedFriendship })
          break

        case 'decline':
        case 'cancel':
          // Decline friend request or cancel sent request
          const requestToDecline = await prisma.friendship.findFirst({
            where: {
              OR: [
                { requesterId: session.user.id, addresseeId: targetUserId, status: 'pending' },
                { requesterId: targetUserId, addresseeId: session.user.id, status: 'pending' },
              ],
            },
          })

          if (!requestToDecline) {
            return res.status(404).json({ error: 'Friend request not found' })
          }

          await prisma.friendship.delete({
            where: { id: requestToDecline.id },
          })

          res.status(200).json({ status: null })
          break

        case 'unfriend':
          // Remove friendship
          const friendshipToRemove = await prisma.friendship.findFirst({
            where: {
              OR: [
                { requesterId: session.user.id, addresseeId: targetUserId, status: 'accepted' },
                { requesterId: targetUserId, addresseeId: session.user.id, status: 'accepted' },
              ],
            },
          })

          if (!friendshipToRemove) {
            return res.status(404).json({ error: 'Friendship not found' })
          }

          await prisma.friendship.delete({
            where: { id: friendshipToRemove.id },
          })

          res.status(200).json({ status: null })
          break

        case 'block':
          // Block user
          const existingBlock = await prisma.friendship.findFirst({
            where: {
              requesterId: session.user.id,
              addresseeId: targetUserId,
            },
          })

          if (existingBlock) {
            await prisma.friendship.update({
              where: { id: existingBlock.id },
              data: { status: 'blocked' },
            })
          } else {
            await prisma.friendship.create({
              data: {
                requesterId: session.user.id,
                addresseeId: targetUserId,
                status: 'blocked',
              },
            })
          }

          res.status(200).json({ status: 'blocked' })
          break

        default:
          return res.status(400).json({ error: 'Invalid action' })
      }
    } catch (error) {
      console.error('Error handling friend action:', error)
      res.status(500).json({ error: 'Failed to perform friend action' })
    }
  } else if (req.method === 'GET') {
    try {
      // Get user's friends
      const friends = await prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: session.user.id, status: 'accepted' },
            { addresseeId: session.user.id, status: 'accepted' },
          ],
        },
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          addressee: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      // Format friends list
      const friendsList = friends.map(friendship => {
        const friend = friendship.requesterId === session.user.id 
          ? friendship.addressee 
          : friendship.requester
        return friend
      })

      res.status(200).json(friendsList)
    } catch (error) {
      console.error('Error fetching friends:', error)
      res.status(500).json({ error: 'Failed to fetch friends' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}