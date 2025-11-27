import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Music, LogOut, User } from 'lucide-react'
import { Button } from '../ui/button'
import { useAuthContext } from '../auth/AuthProvider'

export function Header() {
  const { user, signOut, isAuthenticated } = useAuthContext()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Music className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MusicScanner</span>
          </Link>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                to="/upload"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Upload
              </Link>
            </nav>
          )}

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}