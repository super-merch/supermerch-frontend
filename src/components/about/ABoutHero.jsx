import React from 'react'
import checks from "/Checks.png";

const ABoutHero = () => {
    const check = [
      {
        image: checks,
        desc: "Great 24/7 customer services.",
      },
      {
        image: checks,
        desc: "600+ Dedicated employe.",
      },
      {
        image: checks,
        desc: "50+ Branches all over the world.",
      },
      {
        image: checks,
        desc: "Over 1 Million Electronics Products",
      },
    ];
    return (
      <div>
        <div className="  mt-6">
          <img src="/group2.png" alt="" className="lg:w-[90%] " />
        </div>
        <div className=" flex flex-wrap relative">
          <div className="lg:w-[35%]">
            <div className=" lg:px-12 md:px-12 px-6  lg:pt-16 pt-8">
              {check.map((item, i) => {
                return (
                  <div key={i} className=" flex items-center gap-3 pt-3">
                    <img src={item.image} alt="" className="" />
                    <p>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className=" lg:relative lg:-z-10 bg-smallHeader mb-10 lg:mb-0 lg:px-10 md:px-10 px-6 py-12  lg:rounded-tr-[285px] lg:-mt-[180px] mt-12 lg:h-[444px] md:h-full lg:pt-[220px]  lg:w-[65%]	">
            <button className="text-smallHeader bg-white px-4 py-1.5 font-semibold text-sm">
              WHO WE ARE
            </button>
            <h1 className="text-line font-semibold lg:text-4xl md:text-4xl text-2xl pt-4 ">
              Welcome To SuperMerch
            </h1>
            <p className="text-line lg:text-base md:text-base text-sm max-w-[870px] pt-4">
              Pellentesque ultrices, dui vel hendrerit iaculis, ipsum velit
              vestibulum risus, ac tincidunt diam lectus id magna. Praesent
              maximus lobortis neque sit amet rhoncus. Nullam tempus lectus a
              dui aliquet, non ultricies nibh elementum. Nulla ac nulla dolor.{" "}
            </p>
          </div>
        </div>
      </div>
    );
}

export default ABoutHero