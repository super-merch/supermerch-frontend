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
      className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative overflow-hidden">
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-6">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {blog.title}
        </h3>{" "}
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-img:rounded-lg prose-img:shadow-md"
          dangerouslySetInnerHTML={{
            __html: getContentWithImages(blog)?.slice(0, 100),
          }}
        />
        <p className="text-sm text-gray-600 mb-3">
          {new Date(blog.createdAt).toLocaleDateString(undefined, options)}
        </p>
        <span className="text-blue-600 font-medium text-sm group-hover:gap-2 transition-all duration-300 inline-flex items-center gap-1">
          Read More{" "}
          <FaArrowLeft className="w-3 h-3 rotate-180 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
};

export default BlogCard;
