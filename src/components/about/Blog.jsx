import React from "react";
import blog1 from '/blog1.png'
import blog2 from "/blog2.png";
import blog3 from "/blog3.png";
import tracy1 from '/tracy1.png'
import tracy2 from "/tracy2.png";
import tracy3 from "/tracy3.png";

const BlogCards = () => {
  const blogData = [
    {
      id: 1,
      image: blog1,
      tag: "Technology",
      title:
        "The Impact of Technology on the Workplace: How Technology is Changing",
      icon: tracy1,
      author: "Tracey Wilson",
      date: "August 20, 2022",
    },
    {
      id: 2,
      image: blog2,
      tag: "Technology",
      title:
        "The Impact of Technology on the Workplace: How Technology is Changing",
      icon: tracy2,
      author: "Jason Francisco",
      date: "August 20, 2022",
    },
    {
      id: 3,
      image: blog3,
      tag: "Technology",
      title:
        "The Impact of Technology on the Workplace: How Technology is Changing",
      icon: tracy3,
      author: "Elizabeth Slavin",
      date: "August 20, 2022",
    },
  ];

  return (
    <div className="Mycontainer pt-20 ">
      <h2 className="text-3xl font-bold text-center mb-6">Our Blog</h2>
      <div className="grid mt-16 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogData.map((blog) => (
          <div key={blog.id} className="border lg:p-6 md:p-8 p-4 rounded-lg">
            <div className="mt-3  ">
              <img src={blog.image} alt={blog.title} className="w-full " />
              <div className="pt-6">
                <p className="text-sm  w-fit font-semibold bg-blog p-2 mb-4  text-blogText">
                  {blog.tag}
                </p>
                <h3 className="text-xl lg:text-2xl md:text-2xl sm::text-2xl  font-bold my-2">
                  {blog.title}
                </h3>
                <div className="flex mb-6 pt-2  items-center gap-4 text-gray-600 ">
                  <img src={blog.icon} alt="" />
                  <div className="flex flex-wrap items-center gap-x-4	">
                    <p className="text-tracy lg:text-base md:text-base sm:text-base text-sm">
                      {blog.author}
                    </p>
                    <p className="text-tracy text-sm">{blog.date}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogCards;
