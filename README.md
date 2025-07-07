# Facebook Clone

A modern Facebook clone built with Next.js, Tailwind CSS, and Prisma. Features include social authentication, posting with media upload, friends system, and real-time notifications.

## 🚀 Features

- **Multi-Provider Authentication**: Google, Facebook, Apple, Naver, Kakao login
- **Newsfeed**: Create and view posts with text, images, and videos
- **Friend System**: Send/accept friend requests, manage friendships
- **Profile Pages**: User profiles with posts and friend lists
- **Notifications**: Real-time notifications for likes, comments, and friend activities
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Media Upload**: Support for image and video uploads
- **Real-time Interactions**: Like and comment on posts

## 🛠️ Tech Stack

- **Frontend**: Next.js 13, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: NextAuth.js with multiple providers
- **File Upload**: Multer for handling media uploads
- **Icons**: Heroicons
- **Styling**: Tailwind CSS with custom Facebook-inspired theme

## 🔧 Setup Instructions

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd facebook_clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Copy `.env.local` and update the values:
   ```bash
   cp .env.local .env.local
   ```
   
   Configure the following variables:
   - `DATABASE_URL`: Your database connection string
   - `NEXTAUTH_SECRET`: A secure random string
   - OAuth provider credentials for Google, Facebook, Apple, Naver, Kakao

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### OAuth Provider Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

#### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Add `http://localhost:3000/api/auth/callback/facebook` to Valid OAuth Redirect URIs

#### Apple OAuth
1. Go to [Apple Developer](https://developer.apple.com/)
2. Create a new identifier and key
3. Configure Sign in with Apple

#### Naver OAuth
1. Go to [Naver Developers](https://developers.naver.com/)
2. Create a new application
3. Add login API

#### Kakao OAuth
1. Go to [Kakao Developers](https://developers.kakao.com/)
2. Create a new application
3. Configure Kakao Login

## 📁 Project Structure

```
facebook_clone/
├── components/          # Reusable React components
│   ├── Layout.js       # Main layout wrapper
│   ├── PostCard.js     # Individual post component
│   └── PostForm.js     # Post creation form
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   │   ├── auth/      # Authentication endpoints
│   │   ├── posts/     # Post-related endpoints
│   │   ├── friends/   # Friend system endpoints
│   │   └── notifications/ # Notification endpoints
│   ├── profile/       # User profile pages
│   ├── friends.js     # Friends management page
│   ├── notifications.js # Notifications page
│   └── index.js       # Home/newsfeed page
├── prisma/            # Database schema and migrations
├── lib/               # Utility functions and configurations
├── styles/            # Global styles and Tailwind config
└── public/            # Static assets and uploads
```

## 🎨 Design System

The project uses a custom design system inspired by Facebook's current design:

- **Colors**: Custom Facebook blue palette
- **Typography**: System fonts (Helvetica, Arial)
- **Components**: Card-based layout with rounded corners
- **Shadows**: Subtle drop shadows for depth
- **Responsive**: Mobile-first responsive design

## 🔐 Security Features

- **Authentication**: Secure OAuth implementation
- **File Upload**: File type and size validation
- **Database**: Prisma ORM with type safety
- **Session Management**: Secure session handling with NextAuth

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Facebook for design inspiration
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first styling
- Prisma for the excellent ORM
- NextAuth.js for authentication made simple

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Tailwind CSS