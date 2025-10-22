import React from 'react';
import Tooltip from './Tooltip';
import { FaInfoCircle, FaHeart, FaShoppingCart, FaUser } from 'react-icons/fa';

/**
 * Example usage of the Tooltip component
 * This file demonstrates all customization options
 */
const TooltipExample = () => {
  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-secondary mb-8">
          Tooltip Component Examples
        </h1>

        {/* Basic Usage */}
        <section className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Basic Usage</h2>
          <div className="flex gap-4 flex-wrap">
            <Tooltip content="This is a basic tooltip">
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                Hover me
              </button>
            </Tooltip>

            <Tooltip content="Tooltip with icon">
              <FaInfoCircle className="text-2xl text-primary cursor-pointer" />
            </Tooltip>
          </div>
        </section>

        {/* Positions */}
        <section className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Positions</h2>
          <div className="flex justify-center items-center gap-8 p-12">
            <Tooltip content="Left tooltip" position="left">
              <button className="px-4 py-2 bg-secondary text-white rounded-lg">
                Left
              </button>
            </Tooltip>

            <div className="flex flex-col gap-8">
              <Tooltip content="Top tooltip" position="top">
                <button className="px-4 py-2 bg-secondary text-white rounded-lg">
                  Top
                </button>
              </Tooltip>

              <Tooltip content="Bottom tooltip" position="bottom">
                <button className="px-4 py-2 bg-secondary text-white rounded-lg">
                  Bottom
                </button>
              </Tooltip>
            </div>

            <Tooltip content="Right tooltip" position="right">
              <button className="px-4 py-2 bg-secondary text-white rounded-lg">
                Right
              </button>
            </Tooltip>
          </div>
        </section>

        {/* Variants */}
        <section className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Variants</h2>
          <div className="flex gap-4 flex-wrap">
            <Tooltip content="Dark variant (default)" variant="dark">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400">
                Dark
              </button>
            </Tooltip>

            <Tooltip content="Light variant with shadow" variant="light">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400">
                Light
              </button>
            </Tooltip>

            <Tooltip content="Primary color variant" variant="primary">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400">
                Primary
              </button>
            </Tooltip>

            <Tooltip content="Secondary color variant" variant="secondary">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400">
                Secondary
              </button>
            </Tooltip>
          </div>
        </section>

        {/* Sizes */}
        <section className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Sizes</h2>
          <div className="flex gap-4 flex-wrap">
            <Tooltip content="Small tooltip" size="sm" variant="primary">
              <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Small
              </button>
            </Tooltip>

            <Tooltip content="Medium tooltip (default)" size="md" variant="primary">
              <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Medium
              </button>
            </Tooltip>

            <Tooltip 
              content="Large tooltip with more content to demonstrate the maximum width and text wrapping" 
              size="lg" 
              variant="primary"
            >
              <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Large
              </button>
            </Tooltip>
          </div>
        </section>

        {/* Without Arrow */}
        <section className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Without Arrow</h2>
          <div className="flex gap-4 flex-wrap">
            <Tooltip content="Tooltip without arrow" arrow={false}>
              <button className="px-4 py-2 bg-primary text-white rounded-lg">
                No Arrow
              </button>
            </Tooltip>

            <Tooltip content="Light variant without arrow" variant="light" arrow={false}>
              <button className="px-4 py-2 bg-secondary text-white rounded-lg">
                Light No Arrow
              </button>
            </Tooltip>
          </div>
        </section>

        {/* Custom Delay */}
        <section className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Custom Delay</h2>
          <div className="flex gap-4 flex-wrap">
            <Tooltip content="No delay" delay={0} variant="primary">
              <button className="px-4 py-2 bg-gray-200 rounded-lg">
                Instant (0ms)
              </button>
            </Tooltip>

            <Tooltip content="Default delay" delay={200} variant="primary">
              <button className="px-4 py-2 bg-gray-200 rounded-lg">
                Default (200ms)
              </button>
            </Tooltip>

            <Tooltip content="Long delay" delay={1000} variant="primary">
              <button className="px-4 py-2 bg-gray-200 rounded-lg">
                Slow (1000ms)
              </button>
            </Tooltip>
          </div>
        </section>

        {/* Disabled */}
        <section className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Disabled Tooltip</h2>
          <div className="flex gap-4 flex-wrap">
            <Tooltip content="This won't show" disabled>
              <button className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
                Disabled Tooltip
              </button>
            </Tooltip>

            <Tooltip content="">
              <button className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
                Empty Content (No Tooltip)
              </button>
            </Tooltip>
          </div>
        </section>

        {/* Real-World Examples */}
        <section className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Real-World Examples</h2>
          <div className="flex gap-6 flex-wrap">
            {/* Product Card Example */}
            <div className="border rounded-lg p-4 w-64">
              <img 
                src="https://via.placeholder.com/200" 
                alt="Product" 
                className="w-full h-48 object-cover rounded mb-3"
              />
              <h3 className="font-semibold mb-2">Sample Product</h3>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-primary">$49.99</span>
                <div className="flex gap-2">
                  <Tooltip content="Add to favorites" position="top" variant="primary">
                    <button className="p-2 rounded-full hover:bg-gray-100">
                      <FaHeart className="text-lg text-gray-600 hover:text-primary" />
                    </button>
                  </Tooltip>

                  <Tooltip content="Add to cart" position="top" variant="secondary">
                    <button className="p-2 rounded-full hover:bg-gray-100">
                      <FaShoppingCart className="text-lg text-gray-600 hover:text-secondary" />
                    </button>
                  </Tooltip>

                  <Tooltip 
                    content="View product details and specifications" 
                    position="top" 
                    size="sm"
                  >
                    <button className="p-2 rounded-full hover:bg-gray-100">
                      <FaInfoCircle className="text-lg text-gray-600" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* User Profile Example */}
            <div className="border rounded-lg p-4 w-64">
              <div className="flex items-center gap-3 mb-4">
                <Tooltip content="View profile" variant="primary" position="right">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center cursor-pointer">
                    <FaUser className="text-white text-xl" />
                  </div>
                </Tooltip>
                <div>
                  <h3 className="font-semibold">John Doe</h3>
                  <p className="text-sm text-gray-600">Premium Member</p>
                </div>
              </div>
              <Tooltip 
                content="Click to manage your account settings and preferences" 
                variant="light"
                size="md"
                position="bottom"
              >
                <button className="w-full px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90">
                  Manage Account
                </button>
              </Tooltip>
            </div>
          </div>
        </section>

        {/* Custom Styling */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Custom Styling</h2>
          <div className="flex gap-4 flex-wrap">
            <Tooltip 
              content="Custom styled tooltip" 
              className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !border-purple-500"
            >
              <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
                Gradient Tooltip
              </button>
            </Tooltip>

            <Tooltip 
              content="Another custom style" 
              className="!rounded-full !px-6"
              variant="dark"
            >
              <button className="px-4 py-2 bg-gray-900 text-white rounded-full">
                Pill Tooltip
              </button>
            </Tooltip>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TooltipExample;

