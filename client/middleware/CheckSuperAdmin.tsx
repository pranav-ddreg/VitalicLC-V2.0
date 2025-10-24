'use client'

import React, { ReactNode, FC } from 'react'
import { useSelector } from 'react-redux'

interface CheckSuperAdminProps {
  children: ReactNode
}

interface UserRole {
  slug?: string
  permissions?: string[]
}

interface User {
  role?: UserRole
}

interface RootState {
  userInfo: {
    user: User | null
  }
}

const CheckSuperAdmin: FC<CheckSuperAdminProps> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.userInfo)

  // If the user is superadmin, hide children
  if (user?.role?.slug === 'superadmin') {
    return null
  }

  return <div>{children}</div>
}

export default CheckSuperAdmin
