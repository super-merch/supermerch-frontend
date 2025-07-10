import { useEffect, useState } from "react";
import axios from "axios";

const useFetchLatestProducts = (
  url,
  token = "NDVhOWFkYWVkZWJmYTU0Njo3OWQ4MzJlODdmMjM4ZTJhMDZlNDY3MmVlZDIwYzczYQ"
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Set headers using axios
        const response = await axios.get(url, {
          headers: {
            "x-auth-token": token,
          },
        });
        console.log(response, "response");

        setData(response.data); // The data is in the response's `data` property
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, token]);

  return { data, loading, error };
};

export default useFetchLatestProducts;
