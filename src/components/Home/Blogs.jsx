import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { IoArrowBackOutline } from "react-icons/io5";
import { IoMdArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { blogsDataArray } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
const Blogs = () => {
  const { blogs, setBlogs, options } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <section className="Mycontainer">
      <div className="px-4 sm:px-6 lg:px-8">
        <h2 className="font-manrope text-4xl font-bold text-gray-900 text-center mb-14">
          Our popular blogs
        </h2>
        <div className=" mb-14 gap-y-8 lg:gap-y-0 lg:gap-x-8">
          <Swiper
            navigation={{
              prevEl: ".custom-prev2",
              nextEl: ".custom-next2",
            }}
            modules={[Navigation]}
            className="mySwiper"
            breakpoints={{
              0: {
                slidesPerView: 1,
                spaceBetween: 0,
              },
              400: {
                slidesPerView: 2,
                spaceBetween: 15,
              },
              580: {
                slidesPerView: 3,
                spaceBetween: 10,
              },
              768: { slidesPerView: 3, spaceBetween: 15 },
              1024: { slidesPerView: 4, spaceBetween: 10 },
            }}
          >
            {blogs?.map((blog, index) => (
              <SwiperSlide key={blog._id || index}>
                <div
                  onClick={() => navigate(`/blogs/${blog?._id}`, {state: blog})}
                  className="group cursor-pointer border border-gray-300 rounded-2xl p-5 transition-all duration-300 hover:border-indigo-600 hover:shadow-lg"
                >
                  <div className="flex items-center mb-6">
                    <img
                      src={blog.image}
                      alt={blog.title || "blog image"}
                      className="rounded-lg w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="block">
                    <h4 className="text-gray-900 font-medium leading-8 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
                      {blog?.title}
                    </h4>
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-sm text-indigo-600 font-semibold">
                        Read More →
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(blog?.createdAt).toLocaleDateString(
                          undefined,
                          options
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="flex justify-center items-center gap-2">
          <div className="lg:-left-6 md:-left-6 -left-0 lg:top-[83%] md:top-[83%] top-[76%] transform -translate-y-1/2 z-10">
            <button className="custom-prev2 disabled:opacity-40 bg-smallHeader text-white lg:p-2 md:p-2 p-1 rounded-full">
              <IoArrowBackOutline className="lg:text-2xl md:text-2xl text-lg" />
            </button>
          </div>
          <div className="lg:-right-6 md:-right-6 -right-0 lg:top-[83%] md:top-[83%] top-[76%] transform -translate-y-1/2 z-10">
            <button className="custom-next2 disabled:opacity-40 bg-smallHeader text-white lg:p-2 md:p-2 p-1 rounded-full">
              <IoMdArrowForward className="lg:text-2xl md:text-2xl text-lg" />
            </button>
          </div>
        </div>
        {/* <a href="javascript:;" className="cursor-pointer border border-gray-300 shadow-sm rounded-full py-3.5 px-7 w-52 flex justify-center items-center text-gray-900 font-semibold mx-auto transition-all duration-300 hover:bg-gray-100">View All</a> */}
      </div>
    </section>
  );
};

export default Blogs;
