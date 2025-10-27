import CustomBreadcrumbs from '@/common/CustomBreadcrumbs'
import React from 'react'
import Header from '@/common/header'
import { Suspense } from 'react'
import PreRegistrationTable from '@/components/pre-registration/pre-registration-table'

function page() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <CustomBreadcrumbs
          list={[
            { name: 'Dashboard', link: '/dashboard' },
            { name: 'Registration', link: '' },
          ]}
        />
        <Header title={'Registration'} />
        <PreRegistrationTable />
      </Suspense>
    </>
  )
}

export default page
