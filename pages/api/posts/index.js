import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname)
    cb(null, uniqueName)
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

// Disable body parser for file upload
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    try {
      // Handle file upload
      await new Promise((resolve, reject) => {
        upload.fields([
          { name: 'image', maxCount: 1 },
          { name: 'video', maxCount: 1 }
        ])(req, res, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      const { content } = req.body
      const imageFile = req.files?.image?.[0]
      const videoFile = req.files?.video?.[0]

      if (!content && !imageFile && !videoFile) {
        return res.status(400).json({ error: 'Content, image, or video is required' })
      }

      const post = await prisma.post.create({
        data: {
          content: content || '',
          image: imageFile ? `/uploads/${imageFile.filename}` : null,
          video: videoFile ? `/uploads/${videoFile.filename}` : null,
          authorId: session.user.id,
        },
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
      })

      res.status(201).json(post)
    } catch (error) {
      console.error('Error creating post:', error)
      res.status(500).json({ error: 'Failed to create post' })
    }
  } else if (req.method === 'GET') {
    try {
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

      res.status(200).json(posts)
    } catch (error) {
      console.error('Error fetching posts:', error)
      res.status(500).json({ error: 'Failed to fetch posts' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}