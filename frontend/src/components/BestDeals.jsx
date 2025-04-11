import React from 'react'

const BestDeals = () => {
    return (
        <div className='w-full h-96 md:h-80 flex flex-col-reverse justify-center items-center md:flex-row'>
            <div className='w-full md:w-1/2 h-full flex gap-3 flex-col justify-center items-start'>
                <p className='font-semibold text-gray-400'>Brand deal</p>
                <h1 className='text-2xl text-gray-800'>Save up to 30% on select Samsung CCTV Camera</h1>
                <p className='text-gray-400 font-thin'>Tortor purus et quis aenean tempus tellus fames. deal</p>
                <a className='font-semibold  text-blue-500'>Shop Now</a>
            </div>
            <div className='w-full md:w-1/2 h-full bg-gray-500 text-b'></div>
        </div>
    )
}

export default BestDeals
