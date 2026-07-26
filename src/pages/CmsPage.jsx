import React from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import useCmsData from "../hooks/useCmsData";
import SeoHelmet from "../components/Common/SeoHelmet";
import NotFound from "./NotFound";

const CmsPage = () => {
  const { slug } = useParams();
  const { data: page, loading } = useCmsData(`/api/cms-pages/by-slug/${slug}`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!page) return <NotFound />;

  return (
    <div className="min-h-screen bg-gray-50">
      <SeoHelmet
        entityType="cmsPage"
        entityId={slug}
        fallback={{ title: `${page.name} - SuperMerch Australia` }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
            {page.name}
          </h1>
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(page.content),
            }}
          />
        </article>
      </div>
    </div>
  );
};

export default CmsPage;
