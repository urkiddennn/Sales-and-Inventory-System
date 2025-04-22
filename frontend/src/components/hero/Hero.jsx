import React from 'react';
import Content from './Content';
import myImage from "../../assets/bg.png"
const Hero = () => {
    const divStyle = {
        backgroundImage: `url(${myImage})`,// Replace with your image URL
        backgroundSize: 'cover', // Ensures the image covers the entire div
        backgroundPosition: 'center'
    }
    return (
        <div className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] bg-gray-200 flex justify-center items-center relative" style={divStyle} >
            <Content />
        </div>
    );
};

export default Hero;
