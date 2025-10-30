import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'
import React from 'react'
import Header from '@/common/header'
import { Suspense } from 'react'
import UserTable from '@/components/admin-tools/users/users-table'

function page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <CustomBreadcrumbs
          list={[
            { name: 'Dashboard', link: '/dashboard' },
            { name: 'Users', link: '' },
          ]}
        />
        <Header title={'Users'} />
        <UserTable />
      </Suspense>
    </>
  )
}

export default page
