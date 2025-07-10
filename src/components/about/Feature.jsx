import React from "react";

import about1 from '/about1.png'
import about2 from "/about2.png";
import about3 from "/about3.png";

const features = [
  {
    title: "Brand Love",
    description:
      "Brand love is built in key moments throughout customer, consumer, and employee journeys. We strengthen brand connection in these critical moments with custom merchandise experiences.We help people love your brand as much as you do.",
    imageUrl: about1,
  },
  {
    title: "Built Better",
    description:
      "We’re fixated not just on the products and solutions you need, but more importantly, the results you need from them. We’ve built the industry’s best technology platforms, supply chain, and logistics network to deliver more authentic, sustainable and effective brand experiences, worldwide.",
    imageUrl: about2,
  },
  {
    title: "Together",
    description:
      "Loved brands are authentic, rewarding and lasting. We build client relationships the same way. Many of the world’s most recognizable brands have been with us for decades because they trust us to expertly complement their strategies and partner with them to solve even the most complex challenges along the way.",
    imageUrl: about3,
  },
];

const Feature = () => {
    return (
      <div className="Mycontainer">
        <h1 className="text-brand pt-8 lg:pt-0 md:pt-0 pb-2 lg:text-3xl md:text-3xl text-2xl">
          Grow Brand Love in Hearts & Markets Around the World.
        </h1>
        <div className="  grid lg:grid-cols-3 md:grid-cols-2 gap-8 my-8 ">
          {features.map((feature, idx) => (
            <div key={idx} className="">
              <img src={feature.imageUrl} alt="" className="w-full mb-4" />
              <h3 className="font-semibold text-2xl  mb-2 mt-4 text-brand">
                {feature.title}
              </h3>
              <p className="text-gogle pt-2 text-base">{feature.description}</p>
            </div>
          ))}
        </div>
        <div className=" grid lg:grid-cols-2 md:grid-cols-1 items-center gap-12 lg:mt-24 md:mt-16 mt-0 rounded-lg ">
          <div>
            <h3 className="font-semibold text-brand max-w-[500px]  lg:text-4xl md:text-4xl text-2xl">
              Nike rates our decoration quality 3 million swooshes!
            </h3>
            <p className="mt-8 text-gogle">
              Our decoration operations are one of a select few certified by
              Nike to reproduce its iconic "swoosh" trademark. Each year, they
              trust us to swoosh over 3 million pieces of retail collegiate
              apparel.
            </p>
            <p className="mt-8 text-gogle">
              Brands of all sizes get the same meticulous quality when their
              merchandise comes from our 500,000 square foot decoration and
              distribution center in Orange City, IA. It runs on 100% renewable
              energy and was awarded a silver medal for sustainability by
              EcoVadis.
            </p>
          </div>
          <div className="flex gap-4">
            <img src="/about4.png" alt="Testimonial" className="w-full" />
          </div>
        </div>
      </div>
    );
};

export default Feature;
