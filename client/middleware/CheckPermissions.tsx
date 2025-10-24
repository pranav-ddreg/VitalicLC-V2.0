'use client'

import React, { ReactNode, FC } from 'react'
import { useSelector } from 'react-redux'

interface CheckPermissionsProps {
  permission: string
  children?: ReactNode // optional now
}

interface UserRole {
  permissions?: string[]
  slug?: string
}

interface User {
  role?: UserRole
}

interface RootState {
  userInfo: {
    user: User | null
  }
}

const CheckPermissions: FC<CheckPermissionsProps> = ({ permission, children }) => {
  const { user } = useSelector((state: RootState) => state.userInfo)

  if (Array.isArray(user?.role?.permissions) && user.role.permissions.includes(permission)) {
    return <>{children}</>
  }

  return null
}

export default CheckPermissions
