
import React, { useContext, useEffect, useState } from 'react';
import { IoMdArrowForward } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { TbTruckDelivery } from 'react-icons/tb';
import { AiOutlineEye } from 'react-icons/ai';
import { BsCursor } from 'react-icons/bs';
import { CiHeart } from 'react-icons/ci';
import { IoCartOutline } from 'react-icons/io5';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AppContext } from '../../context/AppContext';
import noimage from "/noimage.png";

const LatestDeals = () => {
  const navigate = useNavigate();

  const { fetchProducts, products, error, skeletonLoading } = useContext(AppContext)
  useEffect(() => {
    console.log("Latest deals")
    fetchProducts();
  }, []);

  if (error) return <p className="pt-10 text-5xl text-center text-red-500">Error: {error}</p>;

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };
// console.log(products,"LatestDeals products");

  return (
    <div className="pb-6 Mycontainer lg:pb-10 md:pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold text-smallHeader">Trending Now</h1>
          <p className="text-sm text-black">Deals ends in</p>
          <p className="px-2 py-2 text-base text-white bg-heading">
            16d : 21h : 57m : 23s
          </p>
        </div>
        <div onClick={() => navigate("/shop")} className="flex items-center gap-2 cursor-pointer hover:underline">
          <p className="text-sm text-smallHeader">Browse All Product</p>
          <IoMdArrowForward className="text-smallHeader" />
        </div>
      </div>
      <div className="grid gap-5 mt-6 lg:mt-8 md:mt-8 max-default:grid-cols-1 lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
        {skeletonLoading
          ? Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="relative p-4 border rounded-lg shadow-md border-border2">
              <Skeleton height={200} className="rounded-md" />
              <div className="p-4">
                <Skeleton height={20} width={120} className="rounded" />
                <Skeleton height={15} width={80} className="mt-2 rounded" />
                <Skeleton height={25} width={100} className="mt-3 rounded" />
                <Skeleton height={15} width={60} className="mt-2 rounded" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton height={20} width={80} className="rounded" />
                  <Skeleton height={20} width={80} className="rounded" />
                </div>
                <div className="flex justify-between gap-1 mt-6 mb-2">
                  <Skeleton circle height={40} width={40} />
                  <Skeleton height={40} width={120} className="rounded" />
                  <Skeleton circle height={40} width={40} />
                </div>
              </div>
            </div>
          ))
          : products?.slice(0, 4).map((product,ind) => {
            const priceGroups = product.product?.prices?.price_groups || [];
            const basePrice = priceGroups.find((group) => group?.base_price) || {};
            const priceBreaks = basePrice.base_price?.price_breaks || [];
            const realPrice =
              priceBreaks.length > 0 && priceBreaks[0]?.price !== undefined
                ? priceBreaks[0].price
                : '0';

            return (
              <div
                key={ind}
                onClick={() => handleViewProduct(product.meta.id,product.overview.name)}
                className="relative border border-border2 cursor-pointer"
              >
                <img
                  src={product.overview.hero_image ? product.overview.hero_image : noimage}
                  alt=""
                  className="w-full"
                />
                <div className=" absolute top-[2%] left-[5%]">
                  <p className="bg-heading text-white w-fit px-2 rounded-sm text-xs py-1.5">
                    {product.off}
                  </p>
                  <p className="bg-smallHeader text-white w-fit px-2 rounded-sm text-xs py-1.5 mt-2">
                    {product.hot}
                  </p>
                </div>
                <div className="p-4">
                  <div className="text-center ">
                    <h2 className="text-lg font-bold text-brand ">
                      {product.overview.name ? product.overview.name : 'No Name '}
                    </h2>

                    <p className="font-normal text-brand">Code: {product.overview.code}</p>
                    <h2 className="pt-2 text-xl font-semibold text-heading">
                      Price: <span>${realPrice}</span>
                      <span>{product.endPrice}</span>
                    </h2>
                    <p className="pt-2 text-base font-normal text-brand">{product.stock}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      <p className="text-xl text-smallHeader">
                        {' '}
                        <BsCursor />
                      </p>
                      <p className="text-base font-semibold text-brand">Free delivery</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-xl text-smallHeader">
                        <TbTruckDelivery />
                      </p>
                      <p className="text-base font-semibold text-brand">Rush Order</p>
                    </div>
                  </div>
                  <div className="flex justify-between gap-1 mt-6 mb-2">
                    <p className="p-3 text-2xl rounded-sm bg-icons">
                      <CiHeart />
                    </p>
                    <div onClick={() =>
                                  handleViewProduct(product.meta.id)
                                } className="flex items-center justify-center w-full gap-1 px-2 py-3 text-white rounded-sm cursor-pointer bg-smallHeader">
                      <p className="text-xl">
                        <IoCartOutline />
                      </p>
                      <button onClick={() =>
                                  handleViewProduct(product.meta.id)
                                } className="text-sm uppercase">Add to cart</button>
                    </div>
                    <p className="p-3 text-2xl rounded-sm bg-icons">
                      <AiOutlineEye />
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default LatestDeals;
