import React from 'react'

const Stable = () => {
  return (
    <div className="Mycontainer">
      <div className=" grid lg:grid-cols-2 md:grid-cols-1 items-center lg:gap-12 md:gap-8 gap-4 lg:mt-20 md:mt-16 mt-8 rounded-lg ">
        <div className="flex gap-4 mt-6">
          <img src="/about5.png" alt="Testimonial" className="w-full" />
        </div>
        <div>
          <h3 className="font-semibold text-brand max-w-[500px]  lg:text-4xl md:text-4xl sm:text-4xl text-3xl">
            At Staples, inclusion is a verb.
          </h3>
          <p className="lg:mt-8 md:mt-7 sm:mt-6 mt-4 text-gogle">
            Diverse workforces produce superior innovation and business
            results. We support diverse talent with industry-leading inclusion
            resources, such as a Social Justice Resource Center and ten Business
            Resource Groups. We also work with Village Northwest Unlimited to
            employ neurodivergent talent in our operations. Learn more about our
            welcoming culture in our latest CSR report.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Stable