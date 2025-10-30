import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'
import React from 'react'
import Header from '@/common/header'
import { Suspense } from 'react'
import RoleTable from '@/components/admin-tools/roles/roles-table'

function page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <CustomBreadcrumbs
          list={[
            { name: 'Dashboard', link: '/dashboard' },
            { name: 'Roles', link: '' },
          ]}
        />
        <Header title={'Roles'} />
        <RoleTable />
      </Suspense>
    </>
  )
}

export default page
