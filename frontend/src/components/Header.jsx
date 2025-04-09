import React from 'react';
import { IoMdSearch } from "react-icons/io";
import { MdFavoriteBorder } from "react-icons/md";
import { TiShoppingCart } from "react-icons/ti";
const Header = () => {

    return (
        <header className=" text-white flex justify-between items-center flex-col">
            <div className='w-full h-10 bg-green-700'>s</div>
            <div className='w-full h-3/4 flex justify-between items-center px-10 py-5 bg-white text-gray-800'>
                <div className="text-xl font-bold">Sales Inventory</div>
                <nav className="space-x-4">
                    <a href="#" className="hover:underline">Home</a>
                    <a href="#" className="hover:underline">Products</a>
                    <a href="#" className="hover:underline">Cart</a>
                    <a href="#" className="hover:underline">About</a>
                    <a href="#" className="hover:underline">Contact</a>

                </nav>
                <div className="space-x-2 flex justify-center items-center">
                    <button>
                        <IoMdSearch size={"1.5em"} />
                    </button>
                    <button>

                        <MdFavoriteBorder size={"1.5em"} />
                    </button>
                    <button>

                        <TiShoppingCart size={"1.5em"} />
                    </button>

                    <button className="bg-green-700 text-white ml-3 px-3 py-1 rounded">Login</button>
                    <button className="bg-yellow-500 text-black  px-3 py-1 rounded">Sign Up</button>
                </div>
            </div>
        </header>
    );
};

export default Header;
