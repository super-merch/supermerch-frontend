import React from "react";
import { Heading } from "./Heading";

const HeadingExamples = () => {
  return (
    <div className="space-y-12 p-8">
      <h2 className="text-3xl font-bold text-center mb-8">Heading Component Examples</h2>

      {/* Basic Examples */}
      <div className="space-y-8">
        <h3 className="text-xl font-semibold">Basic Examples</h3>

        {/* Simple Title */}
        <Heading title="Simple Title" />

        {/* Title with Description */}
        <Heading title="Title with Description" description="This is a description that explains what this section is about." />

        {/* Title with Subtitle */}
        <Heading subtitle="SUBTITLE" title="Main Title" description="This is a description that explains what this section is about." />
      </div>

      {/* Alignment Examples */}
      <div className="space-y-8">
        <h3 className="text-xl font-semibold">Alignment Examples</h3>

        <Heading title="Left Aligned" description="This heading is aligned to the left." align="left" />

        <Heading title="Center Aligned" description="This heading is centered (default)." align="center" />

        <Heading title="Right Aligned" description="This heading is aligned to the right." align="right" />
      </div>

      {/* Size Examples */}
      <div className="space-y-8">
        <h3 className="text-xl font-semibold">Size Examples</h3>

        <Heading title="Small Size" description="This is a small heading." size="small" />

        <Heading title="Default Size" description="This is the default size heading." size="default" />

        <Heading title="Large Size" description="This is a large heading." size="large" />

        <Heading title="Extra Large Size" description="This is an extra large heading." size="xl" />
      </div>

      {/* Custom Styling Examples */}
      <div className="space-y-8">
        <h3 className="text-xl font-semibold">Custom Styling Examples</h3>

        <Heading
          title="Custom Styled Title"
          description="This heading has custom styling applied."
          titleClassName="text-red-500 font-black"
          descriptionClassName="text-blue-600 italic"
          containerClassName="bg-gray-100 p-6 rounded-lg"
        />

        <Heading
          title="With Underline"
          description="This heading has an underline decoration."
          showUnderline={true}
          underlineClassName="bg-blue-500 w-24"
        />
      </div>

      {/* Homepage Style Examples */}
      <div className="space-y-8">
        <h3 className="text-xl font-semibold">Homepage Style Examples</h3>

        {/* More Ways to Shop Style */}
        <Heading
          title="MORE WAY'S TO SHOP"
          align="left"
          size="default"
          titleClassName="uppercase"
          containerClassName="lg:pt-8 md:pt-8 sm:pt-8 pt-4"
        />

        {/* Shop Our Best Sellers Style */}
        <Heading title="SHOP OUR BEST SELLERS" align="left" size="default" titleClassName="uppercase" />

        {/* Centered Hero Style */}
        <Heading
          title="Welcome to Our Store"
          description="Discover amazing products at great prices"
          align="center"
          size="large"
          showUnderline={true}
          underlineClassName="bg-brand"
        />
      </div>

      {/* Complex Layout Example */}
      <div className="space-y-8">
        <h3 className="text-xl font-semibold">Complex Layout Example</h3>

        <Heading
          subtitle="FEATURED"
          title="New Collection"
          description="Check out our latest arrivals and trending items."
          align="center"
          size="large"
          showUnderline={true}
          containerClassName="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl"
        >
          <div className="flex justify-center mt-6">
            <button className="bg-brand text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all">Shop Now</button>
          </div>
        </Heading>
      </div>
    </div>
  );
};

export default HeadingExamples;
