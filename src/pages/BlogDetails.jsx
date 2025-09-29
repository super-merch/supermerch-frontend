import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { Helmet } from "react-helmet-async";

const BlogDetails = () => {
    const { id } = useParams();
    const { blogs, options } = useContext(AppContext)
    const [blogData, setBlogData] = useState(null)

    useEffect(() => {
        const foundBlog = blogs.find((blog) => blog._id === id);
        setBlogData(foundBlog);
    }, [id, blogs]);

    // Function to inject images into content
    const getContentWithImages = () => {
        if (!blogData?.content || !blogData?.additionalImages?.length) {
            return blogData?.content || '';
        }

        const content = blogData.content;
        const images = blogData.additionalImages;
        
        // Split content into paragraphs
        const paragraphs = content.split('</p>').filter(p => p.trim());
        
        if (paragraphs.length === 0) return content;

        let result = '';
        let imageIndex = 0;

        paragraphs.forEach((paragraph, index) => {
            // Add the paragraph
            result += paragraph + (index < paragraphs.length - 1 ? '</p>' : '');

            // Add an image after every 2-3 paragraphs if we have images left
            if (imageIndex < images.length && (index + 1) % 2 === 0) {
                const side = imageIndex % 2 === 0 ? 'right' : 'left';
                result += `
                    <div class="my-6 ${side === 'right' ? 'float-right ml-6' : 'float-left mr-6'} max-w-xs w-full sm:w-80">
                        <img 
                            src="${images[imageIndex]}" 
                            alt="Blog image ${imageIndex + 1}"
                            class="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        />
                    </div>
                `;
                imageIndex++;
            }
        });

        // If there are remaining images, add them at the end
        while (imageIndex < images.length) {
            const side = imageIndex % 2 === 0 ? 'right' : 'left';
            result += `
                <div class="my-6 ${side === 'right' ? 'float-right ml-6' : 'float-left mr-6'} max-w-xs w-full sm:w-80">
                    <img 
                        src="${images[imageIndex]}" 
                        alt="Blog image ${imageIndex + 1}"
                        class="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    />
                </div>
            `;
            imageIndex++;
        }

        return result;
    };

    return (
        <>
        <Helmet>
        <title>{blogData?.metaTitle || blogData?.title}</title>
        <meta
          name="description"
          content={blogData?.metaDescription || blogData?.content?.slice(0, 150)}
        />
        <meta property="og:title" content={blogData?.metaTitle || blogData?.title} />
      </Helmet>
        <div className="max-w-screen-xl flex justify-center gap-5 items-start max-sm2:flex-col mx-auto p-5 sm:p-8 md:p-12">
            {/* Smaller main image */}
            <div className="max-w-[40%] max-sm2:max-w-[100%] sm2:top-0 sm2:sticky w-full">
                <img src={blogData?.image} className='w-full rounded-md h-auto' alt="" />
            </div>
            
            <div className="flex-1">
                <div className="mt-3 bg-white rounded-b lg:rounded-b-none lg:rounded-r flex flex-col justify-between leading-normal">
                    <div className="">
                        <p className="text-gray-700 text-sm mt-2">Published At:
                            <Link to="#" className="text-indigo-600 font-medium hover:text-gray-900 transition duration-500 ease-in-out">
                                {" "}{new Date(blogData?.createdAt).toLocaleDateString(undefined, options)}
                            </Link>
                        </p>
                        <h1 className="text-gray-900 font-bold text-3xl mb-2">{blogData?.title}</h1>
                        
                        {/* Content with injected images */}
                        <div 
                            className="prose max-w-none overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: getContentWithImages() }} 
                        />
                        
                        {/* Clear floats */}
                        <div className="clear-both"></div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default BlogDetails