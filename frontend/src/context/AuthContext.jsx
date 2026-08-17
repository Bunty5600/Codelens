import { createContext, useContext } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useClerk()

  const user = clerkUser
    ? {
        name:
          clerkUser.fullName ||
          clerkUser.firstName ||
          clerkUser.primaryEmailAddress?.emailAddress ||
          'User',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        joinedAt: clerkUser.createdAt,
      }
    : null

  const logout = () => signOut()


  const updateUser = async (updates) => {
    if (!clerkUser) return
    if (updates.name !== undefined) {
      const [firstName, ...rest] = updates.name.trim().split(/\s+/)
      await clerkUser.update({
        firstName: firstName || '',
        lastName: rest.join(' '),
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user, logout, updateUser, isLoaded }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
