import { useEffect, useState } from "react";
import axios from "axios";

const useFetchProducts = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Set headers using axios
        const response = await axios.get(url, {
          headers: {
            "x-auth-token":
              "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ",
          },
        });

        console.log(response, "response hae ye prodcut ka");

        setData(response.data); // Assuming the data is in the response's `data` property
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  console.log(data, "data ha ye");

  return { data, loading, error };
};

export default useFetchProducts;
