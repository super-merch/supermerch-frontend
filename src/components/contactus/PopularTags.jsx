import React from 'react'

const popularTopics = [
  "How do I return my item?",
  "What is Clicons Returns Policy?",
  "How long is the refund process?",
  "What are the 'Delivery Timelines'?",
  "What is 'Discover Your Daraz Campaign 2022'?",
  "What is the Voucher & Gift Offer in this Campaign?",
  "How to cancel Clicon Order",
  "Ask the Digital and Device Community",
  "How to change my shop name?",
];
const PopularTags = () => {
  return (
    <div className='Mycontainer'>
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-brand text-center mb-5">Popular Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularTopics.map((topic, index) => (
            <li
              key={index}
              href="#"
              className="text-brand text-sm hover:text-hoverColor cursor-pointer"
            >
              {topic}
            </li>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PopularTags