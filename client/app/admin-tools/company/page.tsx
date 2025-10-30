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
            { name: 'Company', link: '' },
          ]}
        />
        <Header title={'Company'} />
        <CompanyTable />
      </Suspense>
    </>
  )
}

export default page
