"use client"

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Home = () => {


    const router = useRouter();
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handlePopupClose = () => {
        setShowPopup(false);
      };
    

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                setPopupMessage("Username or password is incorrect")
                setShowPopup(true);
                throw new Error('Erreur lors de la connexion');
            }else{

            const data = await response.json();
            const authToken = data.token;



            localStorage.setItem('authToken', authToken);

            router.push('/');
        }

        } catch (error) {
            //console.log('Erreur lors de la connexion : ' + error.message);
        }

        
    };


    return (
        <div>

            {showPopup && (
                <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50 bg-gray-500 bg-opacity-50">
                    <div className="relative bg-[#000000] rounded-lg shadow p-5 m-5">
                        <button type="button" onClick={handlePopupClose} className="absolute top-3 end-2.5 text-[#cfdf8f] bg-transparent hover:bg-[#cfdf8f] hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" >
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>

                        </button>
                        <div className="p-4 md:p-5 text-center">
                            <svg className="mx-auto mb-4 text-[#cfdf8f] w-12 h-12 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <h3 className=" text-lg font-normal text-[#cfdf8f] ">{popupMessage}</h3>

                        </div>
                    </div>
                </div>
            )}


            <div className="relative min-h-screen  grid bg-black ">
                <div className="flex flex-col flex-row items-center justify-center  flex-auto min-w-0 ">


                    <div className="flex items-center w-auto p-8 ">
                        <div className="max-w-xl w-full space-y-12">
                            <div className="lg:text-left text-center">

                                <div className="flex items-center justify-center ">
                                    <div className="bg-black flex flex-col w-80  px-8 py-10">
                                        <div className=" flex items-center justify-center">
                                            <img src='https://i.postimg.cc/qNH5HLHJ/f-v2.png' border='0' alt='f-v2' className="w-20" />
                                        </div>

                                        <form className="flex flex-col space-y-4 mt-3" onSubmit={handleSubmit}>

                                            <input type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                required placeholder="Username" className="border rounded-lg py-3 px-3 mt-4 bg-black border-[#cfdf8f] placeholder-white-500 text-white" />

                                            <input type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required placeholder="Password" className="border rounded-lg py-3 px-3 bg-black border-[#cfdf8f] placeholder-white-500 text-white" />


                                            <button type="submit" className="bg-[#cfdf8f] text-black rounded-lg py-3 font-semibold" >Login</button>

                                            <a href="/register"><p className="text-white rounded-lg py-3 font-semibold text-xs flex items-center justify-center underline">Don't have an account yet ? Sign Up</p></a>

                                        </form>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </div>





    );
};

export default Home;