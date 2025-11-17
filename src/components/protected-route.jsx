"use client"

import { useAuth } from "../lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function ProtectedRoute({ children, requiredRole }) {
  const { user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!token || !user) {
      router.push("/")
      return
    }

    if (requiredRole && !requiredRole.includes(user.role)) {
      router.push("/")
    }
  }, [token, user, requiredRole, router])

  if (!token || !user) {
    return null
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
