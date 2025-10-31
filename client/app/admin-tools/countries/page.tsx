import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'
import React from 'react'
import Header from '@/common/header'
import { Suspense } from 'react'
import CountryTable from '@/components/admin-tools/country/country-table'

function page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <CustomBreadcrumbs
          list={[
            { name: 'Dashboard', link: '/dashboard' },
            { name: 'Countries', link: '' },
          ]}
        />
        <Header title={'Countries'} />
        <CountryTable />
      </Suspense>
    </>
  )
}

export default page
