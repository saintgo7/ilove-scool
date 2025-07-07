const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3.Database('./i_love_school.db');
        this.initDatabase();
    }

    initDatabase() {
        // Create users table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                bio TEXT,
                location TEXT,
                website TEXT,
                avatar TEXT DEFAULT '/images/default-avatar.png',
                cover_image TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create posts table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                image_url TEXT,
                video_url TEXT,
                likes_count INTEGER DEFAULT 0,
                comments_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `);

        // Create comments table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `);

        // Create likes table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS likes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(post_id, user_id),
                FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `);

        // Create friendships table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS friendships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                requester_id INTEGER NOT NULL,
                addressee_id INTEGER NOT NULL,
                status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'blocked')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(requester_id, addressee_id),
                FOREIGN KEY (requester_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (addressee_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `);

        // Create notifications table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('like', 'comment', 'friend_request', 'friend_accept')),
                content TEXT NOT NULL,
                from_user_id INTEGER,
                post_id INTEGER,
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
            )
        `);

        // Create sessions table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `);

        // Insert sample data
        this.insertSampleData();
    }

    async insertSampleData() {
        // Check if users already exist
        this.db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
            if (err || row.count > 0) return;

            // Create sample users
            const sampleUsers = [
                {
                    username: 'john_doe',
                    email: 'john@example.com',
                    password: 'password123',
                    name: 'John Doe',
                    bio: 'Computer Science student passionate about learning and technology! 💻',
                    location: 'Seoul, South Korea'
                },
                {
                    username: 'jane_smith',
                    email: 'jane@example.com',
                    password: 'password123',
                    name: 'Jane Smith',
                    bio: 'Mathematics major who loves solving complex problems! 📐',
                    location: 'Busan, South Korea'
                },
                {
                    username: 'mike_johnson',
                    email: 'mike@example.com',
                    password: 'password123',
                    name: 'Mike Johnson',
                    bio: 'Web development enthusiast learning JavaScript and React! 🚀',
                    location: 'Tokyo, Japan'
                }
            ];

            sampleUsers.forEach(async (user, index) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                this.db.run(
                    `INSERT INTO users (username, email, password, name, bio, location) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [user.username, user.email, hashedPassword, user.name, user.bio, user.location],
                    function(err) {
                        if (err) {
                            console.log('Error inserting user:', err);
                            return;
                        }
                        
                        // Insert sample posts for each user
                        const userId = this.lastID;
                        const samplePosts = [
                            {
                                1: [
                                    'Welcome to I Love School! 🎓📚 This platform helps students connect and share their learning journey together!',
                                    'Just finished my CS assignment! The algorithm was challenging but I finally got it working. Time to celebrate! 🎉'
                                ],
                                2: [
                                    'Just aced my math exam! 🎉✨ Study groups really do work. Thanks to everyone who helped me prepare! 💪',
                                    'Working on calculus problems. Math is beautiful when you understand the logic behind it! ∫∫∫'
                                ],
                                3: [
                                    'Starting a new JavaScript course today! 💻 Anyone else learning web development? Let\'s connect and study together! 🤝',
                                    'Built my first React component today! The feeling when your code finally works is amazing! ⚛️'
                                ]
                            }
                        ];

                        const posts = samplePosts[userId] || [];
                        posts.forEach((content, postIndex) => {
                            this.db.run(
                                `INSERT INTO posts (user_id, content, likes_count) VALUES (?, ?, ?)`,
                                [userId, content, Math.floor(Math.random() * 20) + 1]
                            );
                        });
                    }
                );
            });
        });
    }

    // User methods
    async createUser(userData) {
        const { username, email, password, name, bio, location } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO users (username, email, password, name, bio, location) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [username, email, hashedPassword, name, bio || '', location || ''],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, username, email, name });
                }
            );
        });
    }

    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT * FROM users WHERE email = ?", 
                [email], 
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    async getUserByUsername(username) {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT * FROM users WHERE username = ?", 
                [username], 
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    async getUserById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT id, username, email, name, bio, location, website, avatar, cover_image, created_at FROM users WHERE id = ?", 
                [id], 
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Post methods
    async createPost(userId, content, imageUrl = null, videoUrl = null) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO posts (user_id, content, image_url, video_url) 
                 VALUES (?, ?, ?, ?)`,
                [userId, content, imageUrl, videoUrl],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, user_id: userId, content, image_url: imageUrl, video_url: videoUrl });
                }
            );
        });
    }

    async getPosts(limit = 20, offset = 0) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT p.*, u.name as author_name, u.username as author_username, u.avatar as author_avatar
                FROM posts p
                JOIN users u ON p.user_id = u.id
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?
            `, [limit, offset], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async getPostById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT p.*, u.name as author_name, u.username as author_username, u.avatar as author_avatar
                FROM posts p
                JOIN users u ON p.user_id = u.id
                WHERE p.id = ?
            `, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Like methods
    async toggleLike(userId, postId) {
        return new Promise((resolve, reject) => {
            // Check if like exists
            this.db.get(
                "SELECT * FROM likes WHERE user_id = ? AND post_id = ?",
                [userId, postId],
                (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (row) {
                        // Unlike
                        this.db.run("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [userId, postId]);
                        this.db.run("UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?", [postId]);
                        resolve({ liked: false });
                    } else {
                        // Like
                        this.db.run("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [userId, postId]);
                        this.db.run("UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?", [postId]);
                        resolve({ liked: true });
                    }
                }
            );
        });
    }

    async getPostLikes(postId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT COUNT(*) as count FROM likes WHERE post_id = ?",
                [postId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                }
            );
        });
    }

    // Comment methods
    async createComment(userId, postId, content) {
        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)`,
                [userId, postId, content],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        // Update comment count
                        this.db.run("UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?", [postId]);
                        resolve({ id: this.lastID, user_id: userId, post_id: postId, content });
                    }
                }
            );
        });
    }

    async getPostComments(postId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT c.*, u.name as author_name, u.username as author_username, u.avatar as author_avatar
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.post_id = ?
                ORDER BY c.created_at ASC
            `, [postId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    close() {
        this.db.close();
    }
}

module.exports = Database;