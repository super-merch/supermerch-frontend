import DOMPurify from "dompurify";
import React, { useContext, useEffect, useState } from "react";
import SeoHelmet from "@/components/Common/SeoHelmet";
import { useParams } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { BlogContext } from "@/context/BlogContext";
import BlogCard from "@/components/card/BlogCard";

const BlogDetails = () => {
  const { id } = useParams();
  const { blogs, options, fetchBlogs } = useContext(BlogContext);
  const [blogData, setBlogData] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    if (!blogs?.length) {
      fetchBlogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogs?.length]);

  useEffect(() => {
    const foundBlog = blogs.find((blog) => blog._id === id);
    setBlogData(foundBlog);
  }, [id, blogs]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null || !galleryImages.length) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i + 1) % galleryImages.length);
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex, blogData]);

  if (!blogData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900">Loading blog post...</h3>
        </div>
      </div>
    );
  }

  // Prefer images array; fall back to single legacy image
  const galleryImages =
    blogData.images?.length > 0
      ? blogData.images
      : blogData.image
      ? [blogData.image]
      : [];

  const thumbnailImage = galleryImages[0] || "";
  const extraImages = galleryImages.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <SeoHelmet
        entityType="blog"
        entityId={id}
        fallback={{
          title: blogData?.title ? `${blogData.title} - SuperMerch Blog` : "SuperMerch Blog",
          description: blogData?.metaDescription || blogData?.content?.substring(0, 160),
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-8 lg:py-8">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaCalendarAlt className="w-4 h-4" />
                <span>
                  {new Date(blogData?.createdAt).toLocaleDateString(undefined, options)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaClock className="w-4 h-4" />
                <span>5 min read</span>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {blogData?.title}
            </h1>

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

          {/* Thumbnail (first image — click to open lightbox) */}
          {thumbnailImage && (
            <div className="px-8 lg:px-12 mb-6">
              <div
                className="relative overflow-hidden rounded-xl cursor-pointer group"
                onClick={() => setLightboxIndex(0)}
              >
                <img
                  src={thumbnailImage}
                  alt={blogData?.title}
                  className="w-full h-64 md:h-96 object-contain"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-black/50 text-white text-sm px-3 py-1 rounded-full transition-opacity">
                    Click to enlarge
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Additional images grid */}
          {extraImages.length > 0 && (
            <div className="px-8 lg:px-12 mb-8">
              <h3 className="text-base font-semibold text-gray-700 mb-3">More Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {extraImages.map((src, i) => (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-lg cursor-pointer group aspect-square"
                    onClick={() => setLightboxIndex(i + 1)}
                  >
                    <img
                      src={src}
                      alt={`${blogData?.title} image ${i + 2}`}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Article Body */}
          <div className="px-8 lg:px-12 pb-8 lg:pb-12">
            <div
              className="prose prose-lg max-w-none overflow-x-hidden prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-l-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(blogData?.content || ""),
              }}
            />
          </div>

          {/* Footer */}
          <div className="px-8 lg:px-12 py-6 bg-gray-50 border-t border-gray-200">
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
        </article>
      </div>

      {/* Related Articles */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Related Articles</h2>
          <p className="text-lg text-gray-600">Discover more insights and tips</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs?.slice(0, 3).map((blog, index) => (
            <BlogCard key={index} blog={blog} options={options} />
          ))}
        </div>
      </div>

      {/* Lightbox overlay */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            onClick={() => setLightboxIndex(null)}
          >
            <FaTimes className="w-7 h-7" />
          </button>

          {/* Prev */}
          {galleryImages.length > 1 && (
            <button
              className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10 p-2"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
              }}
            >
              <FaChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-5xl max-h-screen px-16 py-8"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[lightboxIndex]}
              alt={`${blogData?.title} image ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            {galleryImages.length > 1 && (
              <p className="text-center text-white/60 text-sm mt-3">
                {lightboxIndex + 1} / {galleryImages.length}
              </p>
            )}
          </div>

          {/* Next */}
          {galleryImages.length > 1 && (
            <button
              className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10 p-2"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i + 1) % galleryImages.length);
              }}
            >
              <FaChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogDetails;
