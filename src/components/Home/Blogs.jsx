import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { Heading } from "../Common";

const Blogs = () => {
  const { blogs, options } = useContext(AppContext);
  const navigate = useNavigate();

  // Fallback blog data if no blogs are available
  const fallbackBlogs = [
    {
      _id: "fallback-1",
      title: "The Ultimate Guide to Custom Merchandise",
      image: "/shirt.png",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "fallback-2",
      title: "How to Choose the Perfect Promotional Products",
      image: "/cap.png",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "fallback-3",
      title: "Branding Strategies for Small Businesses",
      image: "/bags.jfif",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "fallback-4",
      title: "Trending Corporate Gift Ideas for 2024",
      image: "/pens.jfif",
      createdAt: new Date().toISOString(),
    },
  ];

  // Display only 4 blogs - use fallback if no blogs available
  const displayBlogs = blogs && blogs.length > 0 ? blogs.slice(0, 4) : fallbackBlogs;

  return (
    <div className="w-full">
      <div className="Mycontainer">
        <Heading title="OUR POPULAR BLOGS" align="center" size="default" titleClassName="uppercase" containerClassName="mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayBlogs.map((blog, index) => (
            <div
              key={blog._id || index}
              onClick={() => navigate(`/blogs/${blog?._id}`)}
              className="group cursor-pointer bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl hover:border-blue-500 transition-all duration-300 overflow-hidden h-72 sm:h-80 min-h-[44px]"
            >
              {/* Blog Image */}
              <div className="h-40 sm:h-48 overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title || "blog image"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "/noimage.png";
                  }}
                />
              </div>

              {/* Blog Content */}
              <div className="p-3 sm:p-4 h-32 flex flex-col justify-between">
                <h4 className="text-xs sm:text-sm font-semibold text-brand group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-4 sm:leading-5">
                  {blog?.title}
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-600 font-medium">Read More →</span>
                  <span className="text-gray-500">{new Date(blog?.createdAt).toLocaleDateString(undefined, options)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blogs;
