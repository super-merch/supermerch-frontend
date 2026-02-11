import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import axios from "axios";

import { clearFavourites, loadFavouritesFromDB } from "@/redux/slices/favouriteSlice";
import { toast } from "react-toastify";
import { clearCurrentUser, clearUserCart } from "@/redux/slices/cartSlice";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [token, setToken] = useState(
        localStorage.getItem("token") ? localStorage.getItem("token") : false
    );
    const [userData, setUserData] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [userOrder, setUserOrder] = useState([]);
    const [userStats, setUserStats] = useState({
        deliveredOrders: 0,
        pendingOrders: 0,
        totalSpent: 0,
        totalOrders: 0,
        pages: 1,
    });
    const [loading, setLoading] = useState(true);
    const [addressData, setAddressData] = useState({
        firstName: "",
        lastName: "",
        companyName: "",
        addressLine: "",
        city: "",
        postalCode: "",
        state: "",
        country: "",
        email: "",
        phone: "",
    });
    const [shippingAddressData, setShippingAddressData] = useState({
        firstName: "",
        lastName: "",
        companyName: "",
        addressLine: "",
        city: "",
        postalCode: "",
        state: "",
        country: "",
        email: "",
        phone: "",
    });
    
    const handleLogout = () => {
        localStorage.removeItem("token");
        dispatch(clearFavourites());
        dispatch(clearUserCart());
        dispatch(clearCurrentUser());
        setToken("");
        googleLogout();
    };
    const fetchWebUser = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/auth/get-web-user`, {
                headers: { token  },
            });
            if (data.success) {
                setUserEmail(data.user.email);
                if (data.user.defaultAddress) {
                    setAddressData(data.user.defaultAddress);
                }
                if (data.user.defaultShippingAddress) {
                    setShippingAddressData(data.user.defaultShippingAddress);
                }
                setUserData(data.user);
                return data.user;
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("User Logged Out");
            handleLogout();
        }
        return null;
    };

    const loadUserOrder = async (page, limit = 10) => {
        try {
            if(userData?._id){
                const { data } = await axios.get(
                    `${backendUrl}/api/checkout/user-order/${userData._id}?page=${page}&limit=${limit}`,
                { headers: { token } }
                );
                if (data.success) {
                    setUserOrder(data.orders);
                    setUserStats({
                        deliveredOrders: data.delivered,
                        pendingOrders: data.pending,
                        totalSpent: data.totalSpent,
                        totalOrders: data.total,
                        pages: data.pages,  
                    });
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);  
        }
    };

    useEffect(() => {
        if (!token) return;
        const loadUser = async () => {
            const user = await fetchWebUser();
            if (user?.email) {
                dispatch(loadFavouritesFromDB(user.email));
            }
        };
        loadUser();
    }, [token, dispatch]);

    useEffect(() => {
        if (userData?._id) {
            loadUserOrder(1);
        }
    }, [userData]);

    return ( 
        <AuthContext.Provider
            value={{
                token,
                setToken,
                userData,
                userEmail,
                userOrder,
                setUserOrder,
                userStats,
                setUserStats,
                loading,
                setLoading,
                addressData,
                setAddressData,
                shippingAddressData,
                setShippingAddressData,
                fetchWebUser,
                loadUserOrder,
                handleLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
export { AuthContextProvider};
