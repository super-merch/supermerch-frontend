import React, { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUser,
  FaArrowLeft,
  FaShare,
  FaBookmark,
  FaEye,
  FaClock,
} from "react-icons/fa";
import { AppContext } from "../context/AppContext";
import BlogCard from "@/components/card/BlogCard";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { blogs, options } = useContext(AppContext);
  const [blogData, setBlogData] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const foundBlog = blogs.find((blog) => blog._id === id);
    setBlogData(foundBlog);
  }, [id, blogs]);

  // Function to inject images into content
  const getContentWithImages = (blogData) => {
    if (!blogData?.content || !blogData?.additionalImages?.length) {
      return blogData?.content || "";
    }

    const content = blogData.content;
    const images = blogData.additionalImages;

    // Split content into paragraphs
    const paragraphs = content.split("</p>").filter((p) => p.trim());

    if (paragraphs.length === 0) return content;

    let result = "";
    let imageIndex = 0;

    paragraphs.forEach((paragraph, index) => {
      // Add the paragraph
      result += paragraph + (index < paragraphs.length - 1 ? "</p>" : "");

      // Add an image after every 2-3 paragraphs if we have images left
      if (imageIndex < images.length && (index + 1) % 2 === 0) {
        const side = imageIndex % 2 === 0 ? "right" : "left";
        result += `
                    <div class="my-6 ${
                      side === "right" ? "float-right ml-6" : "float-left mr-6"
                    } max-w-xs w-full sm:w-80">
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
      const side = imageIndex % 2 === 0 ? "right" : "left";
      result += `
                <div class="my-6 ${
                  side === "right" ? "float-right ml-6" : "float-left mr-6"
                } max-w-xs w-full sm:w-80">
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

  if (!blogData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900">
            Loading blog post...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Article Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Article Header */}
          <div className="p-8 lg:py-8">
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaCalendarAlt className="w-4 h-4" />
                <span>
                  {new Date(blogData?.createdAt).toLocaleDateString(
                    undefined,
                    options
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaClock className="w-4 h-4" />
                <span>5 min read</span>
              </div>
              {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaEye className="w-4 h-4" />
                <span>1.2k views</span>
              </div> */}
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {blogData?.title}
            </h1>

            {/* Author Info */}
            <div className="flex items-center gap-4 pb-8 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <FaUser className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">SuperMerch Team</h3>
                <p className="text-sm text-gray-600">Content Team</p>
              </div>
            </div>
          </div>

          {/* Featured Image Section */}
          <div className="px-8 lg:px-12 mb-8">
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={blogData?.image}
                alt={blogData?.title}
                className="w-full h-64 md:h-80 lg:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Article Body */}
          <div className="px-8 lg:px-12 pb-8 lg:pb-12">
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{
                __html: getContentWithImages(blogData),
              }}
            />
          </div>

          {/* Article Footer */}
          <div className="px-8 lg:px-12 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  Promotional Products
                </span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  Business Tips
                </span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  Marketing
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Related Articles Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Related Articles
          </h2>
          <p className="text-lg text-gray-600">
            Discover more insights and tips
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs?.slice(0, 3).map((blog, index) => (
            <BlogCard key={index} blog={blog} options={options} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
