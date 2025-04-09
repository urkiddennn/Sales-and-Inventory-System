import React from 'react'
import { FaShippingFast } from "react-icons/fa";
import { LuBicepsFlexed } from "react-icons/lu";
import { MdSupportAgent } from "react-icons/md";
const Content = () => {
    return (
        <div className='absolute -bottom-11 left- w-3/4 h-26 b border-2 border-gray-400 p-4 flex justify-between items-center bg-white'>
            <div className='flex justify-center items-center'>

                <FaShippingFast size={"3em"} color='orange' />
                <div className='ml-4'>
                    <h1 className='font-bold text-large'>Free Shipping Deals</h1>
                    <p className='font-light text-gray-800'>Redeem free shipping deals</p>
                </div>
            </div>
            <div className='flex justify-center items-center'>
                <LuBicepsFlexed size={"3em"} color='orange' />
                <div className='ml-4'>
                    <h1 className='font-bold text-large'>Flexible Customer reach</h1>
                    <p className='font-light text-gray-800'>Able to chat with the supplier</p>
                </div>
            </div>
            <div className='flex justify-center items-center'>
                <MdSupportAgent size={"3em"} color='orange' />
                <div className='ml-4'>
                    <h1 className='font-bold text-large'>24x7 Support</h1>
                    <p className='font-light text-gray-800'>We support online transaction</p>
                </div>
            </div>
        </div>
    )
}

export default Content
