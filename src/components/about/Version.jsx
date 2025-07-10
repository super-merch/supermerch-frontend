import React from "react";

const Version = () => {
  return (
    <div className=" bg-list lg:mt-20 md:mt-20 mt-10 grid lg:grid-cols-2 items-center ">
      <div className="Mycontainer pt-12 lg:pt-0">
        <h1 className="text-4xl font-semibold">Our Vision</h1>
        <p className="text-gogle text-base pt-6  max-w-[665px] ">
          At SuperMerch, our vision is to revolutionize the online shopping
          experience by making it seamless, personalized, and accessible to
          everyone, everywhere. We aim to empower our customers with a curated
          selection of high-quality products, cutting-edge technology, and
          unparalleled service.
        </p>
        <p className="text-gogle text-base  max-w-[665px] ">
          Our goal is to create a global community where every transaction
          fosters trust, every product delivers value, and every interaction
          inspires delight. By prioritizing innovation, sustainability, and
          inclusivity, we strive to be the most loved and trusted e-commerce
          destination worldwide.
        </p>
      </div>
      <div className="pl-4 lg:pl-0 md:pl-10 lg:pt-0 pt-8">
        <img src="/group.png" alt="" className="w-full" />
      </div>
    </div>
  );
};

export default Version;
