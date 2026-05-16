import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex mb-4 overflow-x-auto pb-2 scrollbar-hide" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 whitespace-nowrap">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary transition-colors duration-200"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
            </svg>
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              {index === items.length - 1 ? (
                <span className="ml-1 text-sm font-semibold text-primary md:ml-2 truncate max-w-[150px] sm:max-w-[300px]">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-primary md:ml-2 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
