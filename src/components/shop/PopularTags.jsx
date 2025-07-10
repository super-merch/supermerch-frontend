import React from 'react'

const foter = [
  {
    tag: "Game",
  },
  {
    tag: "iPhone",
  },
  {
    tag: "TV",
  },

  {
    tag: "Asus Laptops",
  },
  {
    tag: "Macbook",
  },
  {
    tag: "SSD",
  },
  {
    tag: "Graphics Card",
  },
  {
    tag: "Power Bank",
  },
  {
    tag: "Smart TV",
  },
  {
    tag: "Speaker",
  },
  {
    tag: "Tablet",
  },
  {
    tag: "Microwave",
  },
  {
    tag: "Samsung",
  },
];
const PopularTags = () => {
    
  return (
    <div>
      <div className="w-fit">
        <h1 className="text-brand pt-6 uppercase text-base font-medium ">
          Popular Tag
        </h1>
        <div className="flex gap-3 mt-4 flex-wrap">
          {foter.map((item, ind) => {
            return (
              <div key={ind} className=" text-black">
                <p className="border border-footer px-2 py-1 text-sm font-medium">
                  {item.tag}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PopularTags