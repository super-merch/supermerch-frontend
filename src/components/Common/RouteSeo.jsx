import { useLocation } from "react-router-dom";
import SeoHelmet from "./SeoHelmet";
import { getShopSeoContext } from "../../utils/shopSeo";

const SITE_URL = "https://www.supermerch.com.au";
const DEFAULT_IMAGE = `${SITE_URL}/logo-teal.png`;
const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Super Merch",
  url: `${SITE_URL}/`,
  logo: DEFAULT_IMAGE,
  email: "Info@supermerch.com.au",
  telephone: "+61466468528",
  areaServed: "AU",
};

const makeFallback = ({ title, description, keywords, path, ogType = "website" }) => ({
  title,
  description,
  keywords,
  canonicalUrl: `${SITE_URL}${path}`,
  ogImage: DEFAULT_IMAGE,
  ogImageAlt: "Super Merch Australia logo",
  ogType,
  siteName: "Super Merch",
  robots: "index, follow",
});

const RouteSeo = () => {
  const location = useLocation();
  const pathname = location.pathname || "/";
  const shopSeo = getShopSeoContext(location.search);

  if (
    pathname.startsWith("/product/") ||
    pathname.startsWith("/blogs/") ||
    pathname.startsWith("/page/") ||
    pathname.startsWith("/deals/") ||
    pathname.startsWith("/collections/")
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
        structuredData={[ORGANIZATION_SCHEMA]}
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
      entityId: shopSeo.entityId,
      canonicalUrlWhenSeoMissing:
        shopSeo.entityId === "shop" ? undefined : `${SITE_URL}/shop`,
      fallback: makeFallback({
        title: "Shop Promotional Products | Super Merch Australia",
        description: "Browse branded promotional products, custom merchandise, and business giveaways.",
        keywords: "shop promotional products, branded merchandise australia, business giveaways",
        path: shopSeo.canonicalPath,
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
      fallback: {
        ...makeFallback({
          title: "Track Order | Super Merch Australia",
          description: "Track your Super Merch order status and delivery updates.",
          keywords: "track order super merch",
          path: "/track-order",
        }),
        robots: "noindex, nofollow",
      },
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
    const categorySeo = {
      "/promotional": {
        title: "Promotional Products Australia | Super Merch",
        description: "Browse custom promotional products and branded merchandise for Australian businesses, events, teams, and campaigns.",
        keywords: "promotional products australia, branded merchandise, custom promotional items",
      },
      "/hot-deals": {
        title: "Promotional Product Deals | Super Merch Australia",
        description: "Explore current promotional merchandise deals and value offers from Super Merch Australia.",
        keywords: "promotional product deals, branded merchandise specials",
      },
      "/Clothing": {
        title: "Custom Branded Clothing Australia | Super Merch",
        description: "Shop custom branded polos, shirts, jackets, workwear, and apparel for Australian teams and businesses.",
        keywords: "custom clothing australia, branded apparel, embroidered workwear",
      },
      "/Headwear": {
        title: "Custom Branded Headwear Australia | Super Merch",
        description: "Browse custom caps, hats, beanies, and branded headwear for Australian organisations and events.",
        keywords: "custom caps australia, branded hats, promotional headwear",
      },
      "/return-gifts": {
        title: "Custom Return Gifts Australia | Super Merch",
        description: "Discover practical custom return gifts and branded giveaways for celebrations, events, and organisations.",
        keywords: "return gifts australia, custom giveaways, branded gifts",
      },
      "/24hr-production": {
        title: "24-Hour Promotional Products Australia | Super Merch",
        description: "Browse promotional products available with rapid production options for urgent Australian orders.",
        keywords: "24 hour promotional products, urgent branded merchandise",
      },
      "/deals": {
        title: "Deals and Offers | Super Merch Australia",
        description: "View current Super Merch deals on custom promotional products and branded merchandise.",
        keywords: "promotional merchandise deals, super merch offers",
      },
      "/australia-made": {
        title: "Australian-Made Promotional Products | Super Merch",
        description: "Shop Australian-made promotional products and locally produced branded merchandise.",
        keywords: "australian made promotional products, local branded merchandise",
      },
      "/clearance": {
        title: "Promotional Product Clearance | Super Merch Australia",
        description: "Browse clearance promotional products and branded merchandise while stocks last.",
        keywords: "promotional products clearance, merchandise sale",
      },
      "/search": {
        title: "Search Products | Super Merch Australia",
        description: "Search the Super Merch promotional product catalogue.",
        keywords: "search promotional products",
      },
    }[pathname];

    const filteredOrSearch = pathname === "/search" || Boolean(location.search);
    return (
      <SeoHelmet
        entityType="category"
        entityId={pathname.replace(/^\//, "")}
        fallback={{
          ...makeFallback({
            title: categorySeo.title,
            description: categorySeo.description,
            keywords: categorySeo.keywords,
            path: pathname,
          }),
          robots: filteredOrSearch ? "noindex, follow" : "index, follow",
        }}
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
        canonicalUrlWhenSeoMissing={seo.canonicalUrlWhenSeoMissing}
      />
    );
  }

  // The catch-all route renders NotFound, which is the sole 404 SEO owner.
  return null;
};

export default RouteSeo;
