const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Simple in-memory database
let users = [];
let posts = [];
let notifications = [];
let friends = [];

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

function handleAPI(req, res, pathname) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse request body for POST requests
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    let requestData = {};
    try {
      if (body) requestData = JSON.parse(body);
    } catch (e) {
      // Invalid JSON
    }

    if (pathname === '/api/posts' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(posts));
    } else if (pathname === '/api/posts' && req.method === 'POST') {
      const newPost = {
        id: Date.now().toString(),
        content: requestData.content || '',
        author: requestData.author || 'Anonymous',
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: []
      };
      posts.unshift(newPost);
      res.writeHead(201);
      res.end(JSON.stringify(newPost));
    } else if (pathname.startsWith('/api/posts/') && pathname.endsWith('/like') && req.method === 'POST') {
      const postId = pathname.split('/')[3];
      const post = posts.find(p => p.id === postId);
      if (post) {
        post.likes += 1;
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, likes: post.likes }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Post not found' }));
      }
    } else if (pathname === '/api/users' && req.method === 'POST') {
      const newUser = {
        id: Date.now().toString(),
        name: requestData.name || 'User',
        email: requestData.email || '',
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      res.writeHead(201);
      res.end(JSON.stringify(newUser));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
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

// Initialize with some sample data
setTimeout(() => {
  // Sample users
  users.push(
    { id: '1', name: 'John Doe', email: 'john@example.com', createdAt: new Date().toISOString() },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date().toISOString() },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', createdAt: new Date().toISOString() }
  );

  // Sample posts (multilingual support handled by frontend)
  posts.push(
    {
      id: '1',
      content: 'Welcome to I Love School! 🎓📚 This platform helps students connect and share their learning journey together!',
      author: 'John Doe',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      likes: 15,
      comments: [
        { id: '1', author: 'Jane Smith', content: 'This is amazing! Can\'t wait to share my study notes here! 📝', createdAt: new Date().toISOString() }
      ]
    },
    {
      id: '2',
      content: 'Just aced my math exam! 🎉✨ Study groups really do work. Thanks to everyone who helped me prepare! 💪',
      author: 'Jane Smith',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      likes: 8,
      comments: []
    },
    {
      id: '3',
      content: 'Starting a new JavaScript course today! 💻 Anyone else learning web development? Let\'s connect and study together! 🤝',
      author: 'Mike Johnson',
      createdAt: new Date(Date.now() - 900000).toISOString(),
      likes: 12,
      comments: []
    }
  );
}, 1000);