import React from "react";
import { FaArrowLeft, FaCalendar } from "react-icons/fa";
import { Link } from "react-router-dom";

const BlogCard = ({ blog, options }) => {
  return (
    <Link
      key={blog._id}
      to={`/blogs/${blog._id}`}
      className="group flex flex-col bg-white rounded-2xl border border-secondary/10 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:border-primary h-full"
    >
      {/* Image Container */}
      <div className="relative w-full bg-gradient-to-br from-primary/5 to-secondary/5 md:p-6 p-0">
        <div className="aspect-video w-full flex items-center justify-center">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full md:object-contain object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-6">
        <div className="flex-grow">
          <h3 className="md:text-xl text-sm font-bold text-secondary mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {blog.title}
          </h3>
          <p className="md:text-sm text-xs text-secondary/60 mb-4 flex items-center gap-2">
            <FaCalendar />
            {new Date(blog.createdAt).toLocaleDateString(undefined, options)}
          </p>
        </div>

        {/* Read More Button */}
        <div className="pt-4 border-t border-secondary/10">
          <span className="text-primary font-semibold md:text-sm text-xs group-hover:gap-2 transition-all duration-300 inline-flex items-center gap-1">
            Read Full Article
            <FaArrowLeft className="w-3.5 h-3.5 rotate-180 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
