import React, { useState } from 'react'

const faqItems = [
  {
    question: "Where can I watch?",
    answer: "Details about where you can watch.",
  },
  {
    question: "How do I reset my password?",
    answer: "Steps to reset your password.",
  },
  {
    question: "What payment options are available?",
    answer: "Information on payment options.",
  },
  {
    question: "How do I track my order?",
    answer: "Guide to track your order.",
  },
];
const FAQS = () => {

     const [activeFAQ, setActiveFAQ] = useState (null);

     const toggleFAQ = (index) => {
       setActiveFAQ(activeFAQ === index ? null : index);
     };
    
  return (
    <div className='Mycontainer'>
      <div className="max-w-3xl mx-auto mt-8">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{item.question}</h3>
                <span>{activeFAQ === index ? "−" : "+"}</span>
              </div>
              {activeFAQ === index && (
                <p className="mt-2 text-gray-600">{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FAQS