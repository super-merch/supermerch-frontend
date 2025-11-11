import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function QuoteResponse() {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const quoteAction = searchParams.get('action');
  const navigate = useNavigate()
  const respondToQuote = async() => {
    try {
        setLoading(true);
        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/admin-quotes/respond-to-quote/${id}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: quoteAction,
                    comment
                })
            })
            if(response.ok){
                const data = await response.json();
                console.log(data);
                toast.success(data.message);
                navigate('/return-gifts')
            }
            else{
                const data = await response.json();
                console.log(data);
                toast.error(data.message);
                navigate('/return-gifts')
            }
    } catch (error) {
        toast.error("Invalid Error")
        navigate('/return-gifts')
        console.log(error);
    }
    finally{
        setLoading(false);
    }
  }

  return (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
    <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Respond to Quote
      </h2>
      <p className="text-gray-600 mb-6">
        Would you like to add a comment before submitting your response?
      </p>

      <textarea
        rows="4"
        placeholder="Write your comment here (optional)..."
        onChange={(e)=>{setComment(e.target.value)}}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 resize-none"
      ></textarea>

      <div className="flex justify-center gap-3">
        <button disabled={!comment} onClick={respondToQuote} className={`${comment ? 'bg-blue-600' : 'bg-gray-400'} ${comment &&"hover:bg-blue-700"} text-white font-medium py-2 px-4 rounded-lg transition`}>
          Submit with Comment
        </button>
        <button disabled={comment} onClick={respondToQuote} className={`${!comment ? 'bg-blue-600' : 'bg-gray-400'} ${!comment &&"hover:bg-blue-700"} text-white font-medium py-2 px-4 rounded-lg transition`}>
          Submit without Comment
        </button>
      </div>
    </div>
  </div>
);

}
