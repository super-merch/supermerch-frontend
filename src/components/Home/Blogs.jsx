import { useContext } from "react";
import { FaArrowRight, FaCalendarAlt, FaEye } from "react-icons/fa";
import { IoMdArrowForward } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { AppContext } from "../../context/AppContext";
import BlogCard from "../card/BlogCard";
const Blogs = () => {
  const { blogs, setBlogs, options } = useContext(AppContext);
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

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="Mycontainer">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FaEye className="w-4 h-4" />
            Latest Insights
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Our Popular{" "}
            <span className="bg-blue-600 bg-clip-text text-transparent">
              Blogs
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Stay updated with the latest trends, tips, and insights in
            promotional products and business marketing.
          </p>
        </div>

        {/* Blog Carousel */}
        <div className="relative">
          <Swiper
            navigation={{
              prevEl: ".blog-prev",
              nextEl: ".blog-next",
            }}
            modules={[Navigation]}
            className="blog-swiper"
            breakpoints={{
              0: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
            }}
          >
            {blogs?.length > 0 ? (
              blogs?.map((blog, index) => (
                <SwiperSlide key={blog._id || index}>
                  <BlogCard key={index} blog={blog} options={options} />
                </SwiperSlide>
              ))
            ) : (
              <div className="col-span-full flex justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaEye className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No blogs available
                  </h3>
                  <p className="text-gray-600">
                    Check back later for the latest blog posts.
                  </p>
                </div>
              </div>
            )}
          </Swiper>

          {/* Navigation Buttons */}
          <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10">
            <button className="blog-prev bg-white shadow-lg hover:shadow-xl text-gray-600 hover:text-blue-600 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-200 hover:border-blue-200">
              <IoArrowBackOutline className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
            <button className="blog-next bg-white shadow-lg hover:shadow-xl text-gray-600 hover:text-blue-600 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-200 hover:border-blue-200">
              <IoMdArrowForward className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            View All Blogs
            <FaArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blogs;
