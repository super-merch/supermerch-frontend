import React, { useState, useEffect } from "react";
import { Heading } from "../Common";

const LetsConnect = () => {
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback data for when Instagram API is not available
  const fallbackPosts = [
    {
      id: "fallback-1",
      image: "/shirt.png",
      caption: "Custom T-Shirts - Perfect for your team branding! 👕✨",
      link: "https://www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw",
    },
    {
      id: "fallback-2",
      image: "/cap.png",
      caption: "Premium Quality Caps - Make a statement with your logo! 🧢",
      link: "https://www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw",
    },
    {
      id: "fallback-3",
      image: "/bags.jfif",
      caption: "Eco-friendly Bags - Sustainable promotional products! 👜",
      link: "https://www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw",
    },
    {
      id: "fallback-4",
      image: "/pens.jfif",
      caption:
        "Professional Writing Tools - Branded pens for your business! ✍️",
      link: "https://www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw",
    },
  ];

  useEffect(() => {
    fetchInstagramPosts();
  }, []);

  const fetchInstagramPosts = async () => {
    try {
      setLoading(true);

      // Note: Instagram Basic Display API requires proper setup
      // For now, we'll use fallback data
      // In production, you would need to:
      // 1. Set up Instagram Basic Display API
      // 2. Get access token
      // 3. Make API calls to fetch posts

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Use fallback data for now
      setInstagramPosts(fallbackPosts);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching Instagram posts:", err);
      setError("Failed to load Instagram posts");
      setInstagramPosts(fallbackPosts);
      setLoading(false);
    }
  };

  const handlePostClick = (postLink) => {
    window.open(postLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full py-12" style={{ backgroundColor: "#EFE5FC" }}>
      <div className="Mycontainer">
        <Heading
          title="Let's Connect"
          description="Follow us on Instagram for the latest updates and behind-the-scenes content"
          align="center"
          size="large"
          titleClassName="uppercase"
          descriptionClassName="text-gray-600"
          containerClassName="mb-12 py-0 !py-0"
        >
          <div className="flex justify-center mt-4">
            <a
              href="https://www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base min-h-[44px]"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              @supermerch_official
            </a>
          </div>
        </Heading>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
              >
                <div className="h-48 sm:h-64 bg-gray-300"></div>
                <div className="p-3 sm:p-4">
                  <div className="h-3 sm:h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {instagramPosts.map((post, index) => (
              <div
                key={post.id}
                onClick={() => handlePostClick(post.link)}
                className="group cursor-pointer bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-105 min-h-[44px]"
              >
                {/* Instagram Post Image */}
                <div className="relative h-36 sm:h-64 overflow-hidden">
                  <img
                    src={post.image}
                    alt="Instagram post"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = "/noimage.png";
                    }}
                  />
                  {/* Instagram Icon Overlay */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white bg-opacity-90 rounded-full p-1.5 sm:p-2">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                </div>

                {/* Post Caption */}
                <div className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-700 line-clamp-3 group-hover:text-blue-600 transition-colors duration-300">
                    {post.caption}
                  </p>
                  <div className="mt-2 sm:mt-3 flex items-center text-xs text-gray-500">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span>@supermerch_official</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LetsConnect;
