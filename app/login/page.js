"use client"

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';


const Home = () => {



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
                throw new Error('Erreur lors de la connexion');
            }
    
            const data = await response.json();
            const authToken = data.token;
    
  
            localStorage.setItem('authToken', authToken);
    
            alert('Connexion réussie !');
    
        } catch (error) {
            alert('Erreur lors de la connexion : ' + error.message);
        }
    };


    return (
        <div>


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