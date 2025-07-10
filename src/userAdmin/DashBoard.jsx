import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

const DashBoard = () => {
    const { backednUrl, handleLogout } = useContext(AppContext);
    const [userEmail, setUserEmail] = useState("");
    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                const token = localStorage.getItem("token");
                const { data } = await axios.get(`${backednUrl}/api/auth/user`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (data.success) setUserEmail(data.email);
                console.log(data, 'data login');

            } catch (error) {
                console.error("Error fetching user email:", error.response?.data || error.message);
            }
        };

        fetchUserEmail();
    }, []);

    return (
      <>
        <div className='w-full px-4 pt-2 pb-4 text-xl lg:px-8 md:px-8 lg:pt-6 md:pt-6 '>
          <h1>
            Welcome{' '}
            <span className='font-semibold text-black '>{userEmail}</span> (not{' '}
            <span className='font-semibold text-black'>{userEmail}? </span>{' '}
            <span
              onClick={handleLogout}
              className='font-semibold text-blue-500 cursor-pointer '
            >
              Log out)
            </span>{' '}
          </h1>
        </div>
      </>
    );
};

export default DashBoard;
