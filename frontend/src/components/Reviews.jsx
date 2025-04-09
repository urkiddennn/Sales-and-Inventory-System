import React from 'react';

const Reviews = () => {
    const reviews = Array(6).fill({
        rating: 5,
        comment: 'Great product! Highly recommend.',
        user: 'John Doe',
    });

    return (
        <section className="py-6 w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Customer Reviews</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review, index) => (
                    <div key={index} className="p-4 bg-white ">
                        <div className="flex gap-y-5 items-center mb-2">
                            {[...Array(review.rating)].map((_, i) => (
                                <svg
                                    key={i}
                                    className="w-5 h-5 text-yellow-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                        <div className='flex justify-start items-center mt-3'>
                            <div className='w-12 h-12 bg-gray-500 rounded-full'></div>
                            <p className="text-gray-500 text-lg ml-2 font-bold ">{review.user}</p>
                        </div>

                    </div>
                ))}
            </div>
        </section>
    );
};

export default Reviews;
