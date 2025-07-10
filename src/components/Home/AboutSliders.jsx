import React, { useContext, useEffect } from "react";
import { IoMdArrowForward } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
// import useFetchLatestDeals from "../../hooks/useFetchLatestDeals";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const AboutSliders = () => {
  const { fetchProducts, products, error, skeletonLoading } = useContext(AppContext)
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`, { state: "Home" });
  };

  if (error)
    return <p className="pt-10 text-5xl text-center text-red-500">Error: {error}</p>;
  return (
    <div className='relative Mycontainer'>
      <div className='absolute lg:-left-6 md:-left-6 -left-3 top-[38%] z-10'>
        <button className='p-1 text-white rounded-full custom-prev bg-smallHeader lg:p-2 md:p-2'>
          <IoArrowBackOutline className='text-lg lg:text-2xl md:text-2xl' />
        </button>
      </div>
      <div className='absolute lg:-right-6 md:-right-6 -right-3 top-[38%] z-10'>
        <button className='p-1 text-white rounded-full custom-next bg-smallHeader lg:p-2 md:p-2'>
          <IoMdArrowForward className='text-lg lg:text-2xl md:text-2xl' />
        </button>
      </div>

      <Swiper
        navigation={{ prevEl: '.custom-prev', nextEl: '.custom-next' }}
        modules={[Navigation]}
        className='mySwiper'
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 15 },
          400: { slidesPerView: 2, spaceBetween: 15 },
          580: { slidesPerView: 3, spaceBetween: 10 },
          768: { slidesPerView: 4, spaceBetween: 15 },
          1024: { slidesPerView: 6, spaceBetween: 10 },
        }}
      >
        {skeletonLoading
          ? Array(6)
            .fill(null)
            .map((_, index) => (
              <SwiperSlide key={index}>
                <div className='w-full h-full'>
                  <div className='w-full h-full m-auto text-center border rounded bg-line lg:min-h-48 xl:min-h-64 md:min-h-48'>
                    <Skeleton height={160} width={160} className='m-auto' />
                    <Skeleton
                      height={20}
                      width={80}
                      className='m-auto my-10'
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))
          : products.filter((product) => {
            const priceGroups = product.product?.prices?.price_groups || [];
            const basePrice = priceGroups.find((group) => group?.base_price) || {};
            const priceBreaks = basePrice.base_price?.price_breaks || [];
            const realPrice =
              priceBreaks.length > 0 && priceBreaks[0]?.price !== undefined
                ? priceBreaks[0].price
                : '0';
            return realPrice !== '0';
          })?.map((product, ind) => (
            <SwiperSlide key={ind}>
              <div
                key={product?.id}
                onClick={() => handleViewProduct(product?.meta?.id)}
                className='w-full h-full cursor-pointer'
              >
                <div className='w-full h-full m-auto text-center border rounded bg-line lg:min-h-48 xl:min-h-64 md:min-h-48'>
                  <img
                    src={product.overview?.hero_image || 'noimage.png'}
                    className='w-full h-full'
                    alt={product.overview?.name || 'Product Image'}
                  />
                  <p className='px-1 py-2 m-auto text-xs max-w-52'>
                    {product.overview?.name || 'No Name'}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
};

export default AboutSliders;
