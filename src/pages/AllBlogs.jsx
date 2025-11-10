import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "@/context/AppContext";
import { FaArrowRight } from "react-icons/fa";

const AllBlogs = () => {
  const { blogLoading,blogs, options } = useContext(AppContext);
  const navigate = useNavigate();
  if(blogLoading){
    return <div className="flex justify-center items-center min-h-screen" >
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  }
  return (
    <section className="min-h-screen bg-white py-8 sm:py-16">
      <div className="Mycontainer px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
            INSIGHTS & UPDATES
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary">
            Blog & Articles
          </h1>
        </div>

        {blogs?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                onClick={() => navigate(`/blogs/${blog._id}`)}
                className="group cursor-pointer bg-white rounded-xl border border-secondary/10 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Image Section */}
                <div className="relative h-80 overflow-hidden bg-gray-100">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                    ARTICLE
                  </p>
                  <h2 className="text-xl font-bold text-secondary mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {blog.title}
                  </h2>
                  <p className="text-sm text-secondary/60 mb-4">
                    {new Date(blog.createdAt).toLocaleDateString(
                      undefined,
                      options
                    )}
                  </p>
                  <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                    Read More
                    <FaArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-secondary/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-3">
              No Articles Yet
            </h3>
            <p className="text-secondary/60 text-lg">
              Check back soon for new content and insights
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AllBlogs;
