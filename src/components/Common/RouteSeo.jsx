import { useLocation } from "react-router-dom";
import SeoHelmet from "./SeoHelmet";

const SITE_URL = "https://www.supermerch.com.au";
const DEFAULT_IMAGE = `${SITE_URL}/logo-teal.png`;

const makeFallback = ({ title, description, keywords, path, ogType = "website" }) => ({
  title,
  description,
  keywords,
  canonicalUrl: `${SITE_URL}${path}`,
  ogImage: DEFAULT_IMAGE,
  ogType,
  siteName: "Super Merch",
  robots: "index, follow",
});

const RouteSeo = () => {
  const location = useLocation();
  const pathname = location.pathname || "/";

  if (
    pathname.startsWith("/product/") ||
    pathname.startsWith("/blogs/") ||
    pathname.startsWith("/page/") ||
    pathname === "/about" ||
    pathname === "/shop"
  ) {
    return null;
  }

  if (pathname.startsWith("/quote/respond/")) {
    return (
      <SeoHelmet
        entityType="cmsPage"
        entityId="quote-response"
        fallback={{
          ...makeFallback({
            title: "Quote Response | Super Merch Australia",
            description: "Quote response page.",
            keywords: "quote response",
            path: pathname,
          }),
          robots: "noindex, nofollow",
        }}
      />
    );
  }

  if (pathname === "/") {
    return (
      <SeoHelmet
        entityType="cmsPage"
        entityId="home"
        fallback={makeFallback({
          title: "Super Merch Australia | Promotional Products & Custom Merchandise",
          description:
            "Shop premium Australian promotional products, branded merchandise, and custom business gifts with fast turnaround.",
          keywords:
            "promotional products australia, custom merchandise, branded gifts, corporate gifts",
          path: "/",
        })}
      />
    );
  }

  const staticSeoMap = {
    "/shop": {
      entityType: "category",
      entityId: "shop",
      fallback: makeFallback({
        title: "Shop Promotional Products | Super Merch Australia",
        description: "Browse branded promotional products, custom merchandise, and business giveaways.",
        keywords: "shop promotional products, branded merchandise australia, business giveaways",
        path: "/shop",
      }),
    },
    "/about": {
      entityType: "cmsPage",
      entityId: "about",
      fallback: makeFallback({
        title: "About Super Merch Australia",
        description: "Learn about Super Merch and our mission to deliver premium custom merchandise across Australia.",
        keywords: "about super merch, promotional company australia",
        path: "/about",
      }),
    },
    "/contact": {
      entityType: "cmsPage",
      entityId: "contact",
      fallback: makeFallback({
        title: "Contact Super Merch Australia",
        description: "Contact Super Merch for product support, bulk order help, and customization guidance.",
        keywords: "contact super merch, promotional support",
        path: "/contact",
      }),
    },
    "/faqs": {
      entityType: "cmsPage",
      entityId: "faqs",
      fallback: makeFallback({
        title: "FAQs | Super Merch Australia",
        description: "Find answers to shipping, customization, artwork, and order questions.",
        keywords: "super merch faq, shipping faq, artwork faq",
        path: "/faqs",
      }),
    },
    "/privacy": {
      entityType: "cmsPage",
      entityId: "privacy",
      fallback: makeFallback({
        title: "Privacy Policy | Super Merch Australia",
        description: "Read how Super Merch collects, uses, and protects personal information.",
        keywords: "privacy policy super merch",
        path: "/privacy",
      }),
    },
    "/terms": {
      entityType: "cmsPage",
      entityId: "terms",
      fallback: makeFallback({
        title: "Terms and Conditions | Super Merch Australia",
        description: "Read the terms and conditions for using Super Merch services.",
        keywords: "terms and conditions super merch",
        path: "/terms",
      }),
    },
    "/refund-policy": {
      entityType: "cmsPage",
      entityId: "refund-policy",
      fallback: makeFallback({
        title: "Refund Policy | Super Merch Australia",
        description: "Review refund eligibility, timelines, and return support details.",
        keywords: "refund policy super merch",
        path: "/refund-policy",
      }),
    },
    "/artwork-policy": {
      entityType: "cmsPage",
      entityId: "artwork-policy",
      fallback: makeFallback({
        title: "Artwork Policy | Super Merch Australia",
        description: "Artwork guidelines for logo files, print setup, and production quality.",
        keywords: "artwork policy, print file requirements",
        path: "/artwork-policy",
      }),
    },
    "/track-order": {
      entityType: "cmsPage",
      entityId: "track-order",
      fallback: makeFallback({
        title: "Track Order | Super Merch Australia",
        description: "Track your Super Merch order status and delivery updates.",
        keywords: "track order super merch",
        path: "/track-order",
      }),
    },
    "/category": {
      entityType: "category",
      entityId: "category",
      fallback: makeFallback({
        title: "Browse Categories | Super Merch Australia",
        description: "Explore all promotional product categories.",
        keywords: "product categories, promotional categories",
        path: "/category",
      }),
    },
    "/favourites": {
      entityType: "cmsPage",
      entityId: "favourites",
      fallback: {
        ...makeFallback({
          title: "Favourites | Super Merch Australia",
          description: "Your saved favourite products.",
          keywords: "favourite products",
          path: "/favourites",
        }),
        robots: "noindex, nofollow",
      },
    },
    "/upload-artwork": {
      entityType: "cmsPage",
      entityId: "upload-artwork",
      fallback: {
        ...makeFallback({
          title: "Upload Artwork | Super Merch Australia",
          description: "Upload artwork files for your customization request.",
          keywords: "upload artwork",
          path: "/upload-artwork",
        }),
        robots: "noindex, nofollow",
      },
    },
    "/help-center": {
      entityType: "cmsPage",
      entityId: "help-center",
      fallback: makeFallback({
        title: "Help Center | Super Merch Australia",
        description: "Find support resources and answers for ordering and customization.",
        keywords: "help center, support",
        path: "/help-center",
      }),
    },
    "/mail-offer": {
      entityType: "cmsPage",
      entityId: "mail-offer",
      fallback: makeFallback({
        title: "Special Offers | Super Merch Australia",
        description: "Discover current offers and deals from Super Merch.",
        keywords: "special offers, deals",
        path: "/mail-offer",
      }),
    },
    "/pms": {
      entityType: "cmsPage",
      entityId: "pms",
      fallback: makeFallback({
        title: "PMS Color Chart | Super Merch Australia",
        description: "Reference PMS colors for branding and print consistency.",
        keywords: "pms color chart, pantone chart",
        path: "/pms",
      }),
    },
    "/success": {
      entityType: "cmsPage",
      entityId: "success",
      fallback: {
        ...makeFallback({
          title: "Order Success | Super Merch Australia",
          description: "Order confirmation page.",
          keywords: "order success",
          path: "/success",
        }),
        robots: "noindex, nofollow",
      },
    },
    "/cancel": {
      entityType: "cmsPage",
      entityId: "cancel",
      fallback: {
        ...makeFallback({
          title: "Payment Cancelled | Super Merch Australia",
          description: "Payment cancellation page.",
          keywords: "payment cancelled",
          path: "/cancel",
        }),
        robots: "noindex, nofollow",
      },
    },
    "/my-account": {
      entityType: "cmsPage",
      entityId: "my-account",
      fallback: {
        ...makeFallback({
          title: "My Account | Super Merch Australia",
          description: "Manage your profile, orders, and saved details.",
          keywords: "my account",
          path: "/my-account",
        }),
        robots: "noindex, nofollow",
      },
    },
    "/all-blogs": {
      entityType: "blog",
      entityId: "all-blogs",
      fallback: makeFallback({
        title: "Blog | Super Merch Australia",
        description: "Read tips, trends, and guides on promotional products and branded merchandise.",
        keywords: "promotional products blog, branding tips",
        path: "/all-blogs",
      }),
    },
    "/cart": {
      entityType: "cmsPage",
      entityId: "cart",
      fallback: {
        ...makeFallback({
          title: "Your Cart | Super Merch Australia",
          description: "Review and manage your selected promotional products before checkout.",
          keywords: "shopping cart super merch",
          path: "/cart",
        }),
        robots: "noindex, nofollow",
      },
    },
    "/checkout": {
      entityType: "cmsPage",
      entityId: "checkout",
      fallback: {
        ...makeFallback({
          title: "Checkout | Super Merch Australia",
          description: "Secure checkout for your custom promotional products and merchandise orders.",
          keywords: "checkout super merch",
          path: "/checkout",
        }),
        robots: "noindex, nofollow",
      },
    },
    "/login": {
      entityType: "cmsPage",
      entityId: "login",
      fallback: {
        ...makeFallback({
          title: "Login | Super Merch Australia",
          description: "Login to your Super Merch account.",
          keywords: "super merch login",
          path: "/login",
        }),
        robots: "noindex, nofollow",
      },
    },
    "/signup": {
      entityType: "cmsPage",
      entityId: "signup",
      fallback: {
        ...makeFallback({
          title: "Sign Up | Super Merch Australia",
          description: "Create your Super Merch account.",
          keywords: "super merch signup",
          path: "/signup",
        }),
        robots: "noindex, nofollow",
      },
    },
  };

  const dynamicCategoryPaths = [
    "/promotional",
    "/hot-deals",
    "/Clothing",
    "/Headwear",
    "/return-gifts",
    "/24hr-production",
    "/deals",
    "/search",
    "/australia-made",
    "/clearance",
  ];

  if (dynamicCategoryPaths.includes(pathname)) {
    return (
      <SeoHelmet
        entityType="category"
        entityId={pathname.replace(/^\//, "")}
        fallback={makeFallback({
          title: "Shop Promotional Products | Super Merch Australia",
          description: "Explore category-focused promotional products and branded merchandise.",
          keywords: "promotional products categories, branded merchandise",
          path: pathname,
        })}
      />
    );
  }

  const seo = staticSeoMap[pathname];
  if (seo) {
    return (
      <SeoHelmet
        entityType={seo.entityType}
        entityId={seo.entityId}
        fallback={seo.fallback}
      />
    );
  }

  return (
    <SeoHelmet
      entityType="cmsPage"
      entityId="default"
      fallback={makeFallback({
        title: "Super Merch Australia",
        description: "Premium promotional products and custom merchandise.",
        keywords: "super merch australia, promotional products",
        path: pathname,
      })}
    />
  );
};

export default RouteSeo;
