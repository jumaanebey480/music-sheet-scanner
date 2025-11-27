import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { useAuthContext } from './AuthProvider'
import { SignupForm as SignupFormType } from '../../types'

export function SignupForm() {
  const { signUp, loading, error } = useAuthContext()
  const [form, setForm] = useState<SignupFormType>({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!form.email || !form.password || !form.confirmPassword) {
      setFormError('Please fill in all fields')
      return
    }

    if (!form.email.includes('@')) {
      setFormError('Please enter a valid email address')
      return
    }

    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters long')
      return
    }

    if (form.password !== form.confirmPassword) {
      setFormError('Passwords do not match')
      return
    }

    const { error } = await signUp(form.email, form.password)
    if (error) {
      setFormError(error)
    } else {
      setSuccess(true)
    }
  }

  const handleChange = (field: keyof SignupFormType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (formError) setFormError(null)
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-green-600">
              Check your email!
            </CardTitle>
            <CardDescription className="text-center">
              We've sent you a confirmation link. Please check your email and click the link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="text-sm text-center text-muted-foreground w-full">
              Already confirmed?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Enter your details to create your music scanner account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange('email')}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Choose a password (min 6 characters)"
                value={form.password}
                onChange={handleChange('password')}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                disabled={loading}
                required
              />
            </div>
            {(formError || error) && (
              <div className="text-sm text-destructive text-center">
                {formError || error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}