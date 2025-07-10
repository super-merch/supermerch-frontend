import React from 'react'
import Promotional from './Promotional'
import PromotionalNavigate from './PromotionalNavigate'

const PromotionalPage = () => {
    return (
        <div>
            <PromotionalNavigate />
            <Promotional />
            <div className='mt-10'>

                {/* <TabsBtns /> */}
            </div>
        </div>
    )
}

export default PromotionalPage
