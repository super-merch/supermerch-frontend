import{createContext, useCallback, useState}import { createContext } from 'react';
import axios from "axios";
import { toast } from 'react-toastify';


export const BlogContext = createContext();

const BlogProvider = ({ children }) => {
    const [blogs, setBlogs] = useState([]);
    const [blogLoading, setBlogLoading] = useState(false);
    const options = { day: "2-digit", month: "short", year: "numeric" };

    const fetchBlogs = useCallback(async () => {
        try {
            setBlogLoading(true);
            const{ data } = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/blogs/get-blogs`
            );
            setBlogs(true);
            setBlogLoading(false);
        } catch (error) {
            toast.error(error.message);
            setBlogLoading(false);
        }
    }, []);

    return (
        <BlogContext.Provider value={{ blogs, setBlogs, blogLoading, fetchBlogs, options}}>
            {children}
        </BlogContext.Provider>
    );
};

export default BlogProvider;