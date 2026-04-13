import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  FaFacebook,
  FaInstagram,
  FaEnvelope,
  FaUser,
  FaPhone,
  FaEdit,
  FaCommentDots,
  FaPaperPlane,
  FaCheckCircle,
  FaUserTie,
  FaStore,
} from "react-icons/fa";

export default function CallUs() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    querytitle: "",
    queryMessage: "",
    type: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.fullname ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.querytitle ||
      !formData.queryMessage ||
      !formData.type
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (formData.fullname.length < 3) {
      toast.error("Please enter a valid name");
      return;
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Query title and message length greater than 5
    if (formData.querytitle.length < 5 || formData.queryMessage.length < 5) {
      toast.error("Please enter a valid query title and message");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/contact/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.fullname,
            email: formData.email,
            phone: formData.phoneNumber,
            title: formData.querytitle,
            message: formData.queryMessage,
            type: formData.type,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message || "Message Sent Successfully");
      setFormData({
        fullname: "",
        email: "",
        phoneNumber: "",
        querytitle: "",
        queryMessage: "",
        type: "",
      });
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <div className="Mycontainer mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-primary border border-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FaEnvelope className="w-4 h-4" />
            Get in Touch
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Send us a <span className="text-primary bg-clip-text">Message</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We'd love to hear from you. Send us a message and we'll respond as
            soon as possible. Our team is here to help with any questions or
            concerns you may have.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <FaEdit className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Contact Form
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullname"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="fullname"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Phone Number *
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Query Title */}
                <div>
                  <label
                    htmlFor="querytitle"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Query Title *
                  </label>
                  <div className="relative">
                    <FaEdit className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="querytitle"
                      name="querytitle"
                      value={formData.querytitle}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Brief title for your query"
                    />
                  </div>
                </div>

                {/* User Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    I am a: *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="customer"
                        checked={formData.type === "customer"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.type === "customer"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FaUser
                            className={`w-5 h-5 ${
                              formData.type === "customer"
                                ? "text-primary"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`font-medium ${
                              formData.type === "customer"
                                ? "text-blue-900"
                                : "text-gray-700"
                            }`}
                          >
                            Customer
                          </span>
                        </div>
                      </div>
                    </label>

                    <label className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="merchant"
                        checked={formData.type === "merchant"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.type === "merchant"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FaStore
                            className={`w-5 h-5 ${
                              formData.type === "merchant"
                                ? "text-primary"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`font-medium ${
                              formData.type === "merchant"
                                ? "text-blue-900"
                                : "text-gray-700"
                            }`}
                          >
                            Merchant
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Query Message */}
                <div>
                  <label
                    htmlFor="queryMessage"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Message *
                  </label>
                  <div className="relative">
                    <FaCommentDots className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
                    <textarea
                      id="queryMessage"
                      name="queryMessage"
                      value={formData.queryMessage}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white resize-vertical"
                      placeholder="Please describe your query in detail..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-4 px-8 rounded-xl font-semibold hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <FaEnvelope className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Contact Information
                </h3>
              </div>

              <div className="space-y-4">
                <div
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group"
                  onClick={() =>
                    window.open(
                      "https://mail.google.com/mail/?view=cm&to=Info@supermerch.com.au",
                      "_blank"
                    )
                  }
                >
                  <FaEnvelope className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">
                      Info@supermerch.com.au
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group"
                  onClick={() =>
                    window.open(
                      "https://www.facebook.com/share/1DztGRWqfA/",
                      "_blank"
                    )
                  }
                >
                  <FaFacebook className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-medium text-gray-900">Facebook</p>
                    <p className="text-sm text-gray-600">
                      Follow us on Facebook
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group"
                  onClick={() =>
                    window.open(
                      "https://www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw",
                      "_blank"
                    )
                  }
                >
                  <FaInstagram className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-medium text-gray-900">Instagram</p>
                    <p className="text-sm text-gray-600">
                      Follow us on Instagram
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time Card */}
            <div className="bg-primary rounded-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <FaCheckCircle className="w-8 h-8 text-yellow-300" />
                <h3 className="text-xl font-bold">Quick Response</h3>
              </div>
              <p className="text-blue-100 leading-relaxed">
                We typically respond to all inquiries within 24 hours. For
                urgent matters, please call our support line directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
