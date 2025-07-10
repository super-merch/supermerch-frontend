import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';

const BlogDetails = () => {

    const { id } = useParams();  // id will be a string
    const { blogs, options } = useContext(AppContext)
    const [blogData, setBlogData] = useState(null)


    useEffect(() => {
        // fetchBlogsData();
        const foundBlog = blogs.find((blog) => blog._id === id);
        setBlogData(foundBlog);
    }, [id, blogs]);

    return (
        <div className="max-w-screen-xl flex justify-center gap-5 items-start max-sm2:flex-col mx-auto p-5 sm:p-8 md:p-12">
            {/* <div className={`bg-cover h-64 text-center overflow-hidden`}
                // style={{ height: "450px", backgroundImage: `url(${blogData.image})` }}
                style={{ height: "450px ", backgroundImage: `url(${blogData?.image})` }}
            >
            </div> */}
            <div className="max-w-[50%] max-sm2:max-w-[100%] sm2:top-0 sm2:sticky w-full">
                <img src={blogData?.image} className='w-full rounded-md h-full' alt="" />
            </div>
            <div className="flex-1">
                <div
                    className="mt-3 bg-white rounded-b lg:rounded-b-none lg:rounded-r flex flex-col justify-between leading-normal">

                    <div className="">

                        <p className="text-gray-700 text-sm mt-2">Published At:
                            <Link to="#"
                                className="text-indigo-600 font-medium hover:text-gray-900 transition duration-500 ease-in-out">
                                {" "}{new Date(blogData?.createdAt).toLocaleDateString(undefined, options)}
                            </Link>
                        </p>
                        <h1 href="#" className="text-gray-900 font-bold text-3xl mb-2">{blogData?.title}</h1>

                        <div dangerouslySetInnerHTML={{ __html: blogData?.content }} />

                    </div>

                </div>
            </div>
        </div >
    )
}

export default BlogDetails
