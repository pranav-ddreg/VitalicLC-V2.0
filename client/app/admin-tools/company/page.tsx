import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'
import React from 'react'
import Header from '@/common/header'
import { Suspense } from 'react'
import CompanyTable from '@/components/admin-tools/company/company-table'

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
        <CompanyTable />
      </Suspense>
    </>
  )
}

export default page
