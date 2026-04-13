import { useContext, useEffect, useState } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { AppContext } from "../../context/AppContext";
import { AuthContext } from "../../context/AuthContext";
import { Heading } from "../Common";
import noimage from "/noimage.png";

const RecentlyViewed = () => {
  const { backendUrl } = useContext(AppContext);
  const { userData } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const sessionId = localStorage.getItem("rv_session");
        const params = new URLSearchParams();
        if (userData?._id) params.set("userId", userData._id);
        else if (sessionId) params.set("sessionId", sessionId);
        else { setLoading(false); return; }

        const res = await fetch(`${backendUrl}/api/recently-viewed?${params}&limit=12`);
        if (res.ok) {
          const json = await res.json();
          setProducts(json.data || []);
        }
      } catch {
        // Silent
      } finally {
        setLoading(false);
      }
    };
    fetchRecentlyViewed();
  }, [backendUrl, userData]);

  if (loading || products.length === 0) return null;

  const handleCardNavigate = (product) => {
    const slug = (product.productName || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const encodedId = btoa(String(product.productId));
    navigate(`/product/${encodeURIComponent(slug)}?ref=${encodedId}`);
  };

  return (
    <div className="w-full py-10 bg-white">
      <div className="Mycontainer">
        <Heading
          title="Recently Viewed"
          description="Products you've recently looked at"
          align="center"
          size="large"
          titleClassName="uppercase"
          descriptionClassName="text-gray-600"
          containerClassName="mb-8 py-0 !py-0"
          showUnderline={true}
        />

        <div className="relative md:px-8 px-0">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={16}
            slidesPerView={2}
            navigation={{
              prevEl: ".rv-prev",
              nextEl: ".rv-next",
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={products.length > 4}
            breakpoints={{
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 5 },
              1280: { slidesPerView: 6 },
            }}
          >
            {products.map((item, idx) => (
              <SwiperSlide key={`${item.productId}-${idx}`}>
                <div
                  onClick={() => handleCardNavigate(item)}
                  className="group cursor-pointer bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={item.productImage || noimage}
                      alt={item.productName || "Product"}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = noimage; }}
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-medium text-gray-900 line-clamp-2 min-h-[2rem]">
                      {item.productName || "Product"}
                    </h4>
                    {item.supplierName && (
                      <p className="text-[10px] text-gray-500 mt-1 truncate">{item.supplierName}</p>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="rv-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl text-secondary hover:text-primary w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-200 hover:border-primary">
            <BiChevronLeft className="w-6 h-6" />
          </button>
          <button className="rv-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl text-secondary hover:text-primary w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-gray-200 hover:border-primary">
            <BiChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewed;
