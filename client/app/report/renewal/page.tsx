import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'
import React from 'react'
import Header from '@/common/header'
import { Suspense } from 'react'
import RenewalTable from '@/components/renewal/renewal-table'

function page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <CustomBreadcrumbs
          list={[
            { name: 'Dashboard', link: '/dashboard' },
            { name: 'Renewal', link: '' },
          ]}
        />
        <Header title={'Renewal'} />
        <RenewalTable />
      </Suspense>
    </>
  )
}

export default page
