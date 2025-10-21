import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const BlogCard = ({ blog, options }) => {
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

  return (
    <Link
      key={blog._id}
      to={`/blogs/${blog._id}`}
      className="group flex flex-col bg-white rounded-2xl border border-secondary/10 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:border-primary h-full"
    >
      {/* Image Container */}
      <div className="relative w-full bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
        <div className="aspect-video w-full flex items-center justify-center">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-6">
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-secondary mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {blog.title}
          </h3>
          <p className="text-sm text-secondary/60 mb-4 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {new Date(blog.createdAt).toLocaleDateString(undefined, options)}
          </p>
        </div>

        {/* Read More Button */}
        <div className="pt-4 border-t border-secondary/10">
          <span className="text-primary font-semibold text-sm group-hover:gap-2 transition-all duration-300 inline-flex items-center gap-1">
            Read Full Article
            <FaArrowLeft className="w-3.5 h-3.5 rotate-180 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
