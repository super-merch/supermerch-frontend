import React from "react"
import { useState } from "react"
import { toast } from "react-toastify"
import { FaFacebook } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { IoMail } from "react-icons/io5";


export default function CallUs() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    querytitle: "",
    queryMessage: "",
    type:""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if(!formData.fullname || !formData.email || !formData.phoneNumber || !formData.querytitle || !formData.queryMessage || !formData.type){
      toast.error("Please fill in all required fields")
      return
    }
    if(!formData.phoneNumber || formData.phoneNumber.length < 10){
      toast.error("Please enter a valid phone number")
      return
    }
    if(formData.fullname.length < 3){
      toast.error("Please enter a valid name")
      return
    }
    //validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }
    //query title and message length greater then 5
    if(formData.querytitle.length < 5 || formData.queryMessage.length < 5){
      toast.error("Please enter a valid query title and message")
      return
    }
    setIsSubmitting(true)

    const response  = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/contact/add`, {
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
        type: formData.type
      }),
    })
    const data = await response.json()
    if(!response.ok){
      toast.error(data.message)
    }
    toast.success(data.message||"Message Sent Successfully")
    setFormData(
      {
        fullname: "",
        email: "",
        phoneNumber: "",
        querytitle: "",
        queryMessage: "",
        type:""
      }
    )
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">Contact Us</h1>
          <p className="text-lg text-gray-600 text-center">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#080a54] focus:border-[#080a54] outline-none transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#080a54] focus:border-[#080a54] outline-none transition-colors"
                placeholder="Enter your email address"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#080a54] focus:border-[#080a54] outline-none transition-colors"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Query Title */}
            <div>
              <label htmlFor="querytitle" className="block text-sm font-medium text-gray-700 mb-2">
                Query Title *
              </label>
              <input
                type="text"
                id="querytitle"
                name="querytitle"
                value={formData.querytitle}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#080a54] focus:border-[#080a54] outline-none transition-colors"
                placeholder="Brief title for your query"
              />
            </div>

            {/* Query Message */}
            <div>
              <label htmlFor="queryMessage" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="queryMessage"
                name="queryMessage"
                value={formData.queryMessage}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#080a54] focus:border-[#080a54] outline-none transition-colors resize-vertical"
                placeholder="Please describe your query in detail..."
              />
            </div>
            {/* is customer or merchant circuler checkbox */}
            <div className="flex items-center gap-5" >
              <p className="pr-5" >I'am a:</p>
              <div className="flex items-center gap-4" >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="customer"
                    checked={formData.type === "customer"}
                    onChange={handleInputChange}
                  />
                  <span className="text-gray-700">Customer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="merchant"
                    checked={formData.type === "merchant"}
                    onChange={handleInputChange}
                  />
                  <span className="text-gray-700">Merchant</span>
                </label>
              </div>
            </div>
            

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#080a54] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#0a0c60] focus:ring-2 focus:ring-[#080a54] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Sending Message..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>

        {/* Contact Information */}
        <div className="mt-12 flex flex-col items-center text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h3>
          <div className="space-y-2 text-gray-600">
            <p className="flex items-center justify-center gap-2  cursor-pointer" onClick={() => window.open("https://mail.google.com/mail/?view=cm&to=Info@supermerch.com.au", "_blank")} ><IoMail/> Info@supermerch.com.au</p>
            <p className="flex items-center justify-center gap-2  cursor-pointer" onClick={() => window.open("https://www.facebook.com/share/1DztGRWqfA/", "_blank")} ><FaFacebook  />www.facebook.com/share/1DztGRWqfA/  </p>
            <p className="flex items-center justify-center gap-2  cursor-pointer"  onClick={() => window.open("https://www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw", "_blank")}><AiFillInstagram  />www.instagram.com/supermerch_official?igsh=N2FnNndiaHNsbnkw  </p>
          </div>
        </div>
      </div>
    </div>
  )
}
