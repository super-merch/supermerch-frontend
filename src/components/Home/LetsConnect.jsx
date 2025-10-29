import React, { useState, useEffect } from "react";
import { Heading } from "../Common";
import { FaInstagram } from "react-icons/fa";

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
    <div className="w-full py-10 bg-primary/10">
      <div className="Mycontainer">
        <Heading
          title="Let's Connect"
          description="Follow us on Instagram for the latest updates and behind-the-scenes content"
          align="center"
          size="large"
          titleClassName="uppercase"
          descriptionClassName="text-gray-600"
          containerClassName="mb-12 py-0 !py-0"
          showUnderline={true}
        >
          <div className="flex justify-center mt-4">
            <a
              href="https://www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#b551d4] text-white font-semibold rounded-full hover:scale-105 hover:brightness-110 transition duration-300 transform shadow-lg hover:shadow-xl text-sm sm:text-base min-h-[44px]"
            >
              <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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
                    <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>

                {/* Post Caption */}
                <div className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-secondary/70 line-clamp-3 group-hover:text-primary transition-colors duration-300">
                    {post.caption}
                  </p>
                  <div className="flex gap-2 mt-2 sm:mt-3 items-center text-xs text-secondary/70">
                    <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Instagram</span>
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
