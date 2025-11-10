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
import { Heading } from "../Common";
const Blogs = () => {
  const { blogs, setBlogs, options } = useContext(AppContext);
  // Function to inject images into content

  return (
    <section className="bg-white">
      <div className="Mycontainer">
        {/* Header Section */}
        <Heading
          title="Our Popular Blogs"
          align="center"
          size="default"
          titleClassName="uppercase"
          containerClassName=""
          description="Stay updated with the latest trends, tips, and insights in promotional products and business marketing."
          showUnderline={true}
        />

        {/* Blog Carousel */}
        <div className="relative mt-0 md:mt-0">
          <Swiper
            navigation={{
              prevEl: ".blog-prev",
              nextEl: ".blog-next",
            }}
            modules={[Navigation]}
            className="blog-swiper"
            breakpoints={{
              0: {
                slidesPerView: 2,
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
                <SwiperSlide key={blog._id || index} className="my-10">
                  <BlogCard key={index} blog={blog} options={options} />
                </SwiperSlide>
              ))
            ) : (
              <div className="col-span-full flex justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaEye className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-2">
                    No blogs available
                  </h3>
                  <p className="text-secondary/70">
                    Check back later for the latest blog posts.
                  </p>
                </div>
              </div>
            )}
          </Swiper>

          {/* Navigation Buttons */}
          <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10">
            <button className="blog-prev bg-white shadow-lg hover:shadow-xl text-secondary hover:text-primary md:w-12 md:h-12 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-200 hover:border-primary">
              <IoArrowBackOutline className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
            <button className="blog-next bg-white shadow-lg hover:shadow-xl text-secondary hover:text-primary md:w-12 md:h-12 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-200 hover:border-primary">
              <IoMdArrowForward className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link
            to="/all-blogs"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
