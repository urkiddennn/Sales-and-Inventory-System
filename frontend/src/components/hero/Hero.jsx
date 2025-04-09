import React from 'react';
import Content from './Content';

const Hero = () => {
    return (
        <div className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] bg-gray-200 flex justify-center items-center relative">
            <Content />
        </div>
    );
};

export default Hero;
