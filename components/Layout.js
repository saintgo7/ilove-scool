import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  HomeIcon,
  UserGroupIcon,
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

export default function Layout({ children }) {
  const { data: session } = useSession()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <div className="min-h-screen bg-facebook-light">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Search */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-facebook-blue">
                Facebook Clone
              </Link>
              
              <div className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Facebook"
                    className="w-64 pl-10 pr-4 py-2 bg-facebook-light rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-facebook-blue"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Center - Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="navbar-link">
                <HomeIcon className="h-6 w-6" />
              </Link>
              <Link href="/friends" className="navbar-link">
                <UserGroupIcon className="h-6 w-6" />
              </Link>
              <Link href="/notifications" className="navbar-link relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </Link>
            </div>

            {/* Right side - Profile Menu */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-facebook-light"
                >
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-gray-400" />
                  )}
                  <span className="hidden md:block text-sm font-medium">{session?.user?.name}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 bg-white h-screen sticky top-16 p-4 border-r border-gray-200">
          <div className="space-y-2">
            <Link href="/profile" className="sidebar-link">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <UserIcon className="h-6 w-6" />
              )}
              <span className="ml-3">{session?.user?.name}</span>
            </Link>
            
            <Link href="/friends" className="sidebar-link">
              <UserGroupIcon className="h-6 w-6 text-facebook-blue" />
              <span className="ml-3">Friends</span>
            </Link>
            
            <Link href="/groups" className="sidebar-link">
              <svg className="h-6 w-6 text-facebook-blue" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
              <span className="ml-3">Groups</span>
            </Link>
            
            <Link href="/marketplace" className="sidebar-link">
              <svg className="h-6 w-6 text-facebook-blue" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM10 18V9h6v9h-6z" clipRule="evenodd"/>
              </svg>
              <span className="ml-3">Marketplace</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen p-4">
          {children}
        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-80 bg-white h-screen sticky top-16 p-4 border-l border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-facebook-dark mb-4">Contacts</h3>
            {/* Friend list would go here */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-2 hover:bg-facebook-light rounded">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <span className="text-sm">Friend 1</span>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-facebook-light rounded">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <span className="text-sm">Friend 2</span>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}