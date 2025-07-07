const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const formidable = require('formidable');
const Database = require('./database');

// Initialize database
const db = new Database();

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveStatic(req, res, filePath) {
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'text/plain';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

async function handleAPI(req, res, pathname) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle file uploads for posts
  if (pathname === '/api/posts' && req.method === 'POST' && req.headers['content-type']?.includes('multipart/form-data')) {
    try {
      const form = formidable({
        uploadDir: path.join(__dirname, 'public', 'uploads'),
        keepExtensions: true,
        maxFileSize: 50 * 1024 * 1024, // 50MB limit
        multiples: false
      });

      const [fields, files] = await form.parse(req);
      
      const content = fields.content?.[0] || '';
      const userId = fields.userId?.[0];
      const feeling = fields.feeling?.[0] || '';
      
      if (!content || !userId) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Content and userId required' }));
        return;
      }

      let imageUrl = null;
      let videoUrl = null;

      if (files.media) {
        const file = files.media[0];
        const fileName = path.basename(file.filepath);
        const fileExt = path.extname(file.originalFilename || '').toLowerCase();
        
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
          imageUrl = `/uploads/${fileName}`;
        } else if (['.mp4', '.webm', '.mov', '.avi'].includes(fileExt)) {
          videoUrl = `/uploads/${fileName}`;
        }
      }

      const newPost = await db.createPost(userId, content, imageUrl, videoUrl);
      
      // Add feeling if provided
      if (feeling && newPost) {
        newPost.feeling = feeling;
      }
      
      res.writeHead(201);
      res.end(JSON.stringify(newPost));
      return;
    } catch (error) {
      console.error('Upload error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Upload failed' }));
      return;
    }
  }

  // Parse request body for regular POST requests
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', async () => {
    let requestData = {};
    try {
      if (body) requestData = JSON.parse(body);
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    try {
      // Authentication endpoints
      if (pathname === '/api/login' && req.method === 'POST') {
        const { email, password } = requestData;
        
        if (!email || !password) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Email and password required' }));
          return;
        }

        const user = await db.getUserByEmail(email);
        if (!user) {
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
          return;
        }

        const validPassword = await db.verifyPassword(password, user.password);
        if (!validPassword) {
          res.writeHead(401);
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
          return;
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          user: userWithoutPassword,
          message: 'Login successful' 
        }));

      } else if (pathname === '/api/register' && req.method === 'POST') {
        const { username, email, password, name } = requestData;
        
        if (!username || !email || !password || !name) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'All fields required' }));
          return;
        }

        // Check if user exists
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
          res.writeHead(409);
          res.end(JSON.stringify({ error: 'User already exists' }));
          return;
        }

        const newUser = await db.createUser({ username, email, password, name });
        res.writeHead(201);
        res.end(JSON.stringify({ success: true, user: newUser }));

      // Posts endpoints
      } else if (pathname === '/api/posts' && req.method === 'GET') {
        const posts = await db.getPosts();
        res.writeHead(200);
        res.end(JSON.stringify(posts));
        
      } else if (pathname === '/api/posts' && req.method === 'POST') {
        const { content, userId, imageUrl, videoUrl } = requestData;
        
        if (!content || !userId) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Content and userId required' }));
          return;
        }

        const newPost = await db.createPost(userId, content, imageUrl, videoUrl);
        res.writeHead(201);
        res.end(JSON.stringify(newPost));
        
      } else if (pathname.startsWith('/api/posts/') && pathname.endsWith('/like') && req.method === 'POST') {
        const postId = pathname.split('/')[3];
        const { userId } = requestData;
        
        if (!userId) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'userId required' }));
          return;
        }

        const result = await db.toggleLike(userId, postId);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, ...result }));
        
      } else if (pathname.startsWith('/api/posts/') && pathname.endsWith('/comments') && req.method === 'POST') {
        const postId = pathname.split('/')[3];
        const { userId, content } = requestData;
        
        if (!userId || !content) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'userId and content required' }));
          return;
        }

        const comment = await db.createComment(userId, postId, content);
        res.writeHead(201);
        res.end(JSON.stringify(comment));
        
      } else if (pathname.startsWith('/api/posts/') && pathname.endsWith('/comments') && req.method === 'GET') {
        const postId = pathname.split('/')[3];
        const comments = await db.getPostComments(postId);
        res.writeHead(200);
        res.end(JSON.stringify(comments));
        
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'API endpoint not found' }));
      }
    } catch (error) {
      console.error('API Error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle API requests
  if (pathname.startsWith('/api/')) {
    handleAPI(req, res, pathname);
    return;
  }

  // Serve static files
  if (pathname === '/') {
    serveStatic(req, res, path.join(__dirname, 'public', 'index.html'));
  } else if (pathname === '/login') {
    serveStatic(req, res, path.join(__dirname, 'public', 'login.html'));
  } else if (pathname === '/profile') {
    serveStatic(req, res, path.join(__dirname, 'public', 'profile.html'));
  } else if (pathname === '/friends') {
    serveStatic(req, res, path.join(__dirname, 'public', 'friends.html'));
  } else {
    const filePath = path.join(__dirname, 'public', pathname);
    serveStatic(req, res, filePath);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🎓 I Love School server running on http://localhost:${PORT}`);
  console.log('✨ Features available:');
  console.log('📚 - Educational social newsfeed');
  console.log('🔐 - Student authentication');
  console.log('👤 - Student profile pages');
  console.log('👥 - Classmate connections');
  console.log('❤️ - Like and comment on posts');
  console.log('🎯 - Share your learning journey!');
});

// Database is initialized in database.js with sample data