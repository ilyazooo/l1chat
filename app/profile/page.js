"use client"

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { encryptPrivateKey, decryptPrivateKey } from '../../utils/cryptoUtils.js';

const Home = () => {

    const router = useRouter();
    const scrollContainerRef = useRef(null);
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");


    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [importedPrivateKey, setImportedPrivateKey] = useState("");




    useEffect(() => {

        const fetchData = async () => {
            await getConnectedUser();
        };
        fetchData();

    }, []);


    useEffect(() => {

        const fetchData = async () => {

            if (username != '') {
                //
            }
        };

        fetchData();
    }, [username]);

    const handleLoading = () => {
        setIsLoading(true);
    };

    const handleStopLoading = () => {
        setIsLoading(false);
    };

    const handlePopupClose = () => {
        setShowPopup(false);
    };


    const getConnectedUser = async () => {
        const authToken = localStorage.getItem('authToken');

        try {

            const response = await fetch('http://localhost:3000/api/valideToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({})
            });


            if (response.ok) {

                const data = await response.json();
                setUsername(data.username);
                setName(data.username);

            } else {

                router.push('/login');
            }
        } catch (error) {
            console.log('Erreur lors de la vérification du token :', error);
            router.push('/login');
        }
    };



    const waitOneSecond = () => {
        return new Promise(resolve => {
            setTimeout(resolve, 2000);
        });
    };

    async function checkExistingUser(username) {
        try {
            // Appel de l'API pour vérifier si l'utilisateur existe
            const response = await fetch(`http://localhost:3000/api/checkExistingUser?username=${username}`);

            if (response.ok) {
                const data = await response.json();
                return data.exists;
            } else {
                console.error(`Erreur ${response.status} lors de la requête : ${response.statusText}`);
                return false;
            }
        } catch (error) {
            console.error('Erreur lors de la requête :', error);
            return false;
        }
    }

    async function checkUserCredentials(username, password) {
        try {
            const response = await fetch(`http://localhost:3000/api/checkUserCredentials?username=${username}&password=${password}`);

            if (response.ok) {
                const data = await response.json();
                return data.credentialsMatch;
            } else {
                console.error(`Erreur ${response.status} lors de la requête : ${response.statusText}`);
                return false;
            }
        } catch (error) {
            console.error('Erreur lors de la requête :', error);
            return false;
        }
    }


    const handleSignOut = () => {
        localStorage.removeItem('authToken');
        router.push('/login');
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleCurrentPasswordChange = (event) => {
        setCurrentPassword(event.target.value);
    };

    const handleNewPasswordChange = (event) => {
        setNewPassword(event.target.value);
    };


    const handleImportedPrivateKey = (event) => {
        setImportedPrivateKey(event.target.value);
    };

    
    const handleUpdateProfile = async (password) => {

        try {
            const response = await fetch('http://localhost:3000/api/checkUserCredentials', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentUsername,
                    password,
                }),
            });

        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const saveChanges = async () => {

        let isNewName = false;
        let isNewPassword = false;
        let isNewPrivateKey = false;

        ///CASE 
        if (name != username) {
            isNewName = true;
            if (await checkExistingUser(name) == false) {
                setPopupMessage("Username already exists.")
                setShowPopup(true);
                return;
            }
        }

        if (currentPassword != '') {
            if (await checkUserCredentials(username, currentPassword) == false) {
                setPopupMessage("Wrong password.")
                setShowPopup(true);
                return;
            }


        } else {
            setPopupMessage("Please enter your password.")
            setShowPopup(true);
            return;
        }


        if (newPassword.length <= 8 && newPassword != "") {

            setPopupMessage("New password must be at least 8 characters long.")
            setShowPopup(true);
            return;
        }

        if (newPassword != "") {
            isNewPassword = true;
        }

        if (importedPrivateKey != "") {
            isNewPrivateKey = true;
        }


        ////CASE 1 - ONLY NEW PRIVATE KEY
        if (isNewPrivateKey && !isNewPassword && !isNewName) {
            try {
                const encryptedPrivateKey = encryptPrivateKey(importedPrivateKey);
                localStorage.setItem(`encryptedPrivateKey_${username}`, encryptedPrivateKey);
            } catch (error) {
                console.log(error);
            }

            setPopupMessage("New private key succesfully imported.")
            setShowPopup(true);
            setImportedPrivateKey("");
            setCurrentPassword("");
            return;
        }


        if(!isNewPrivateKey && (isNewPassword || isNewName)){
            handleUpdateProfile(newPassword);
            setPopupMessage("New changes applied.")
            setShowPopup(true);
            setImportedPrivateKey("");
            setCurrentPassword("");
            setNewPassword("");
            return;

        }

        if(isNewPrivateKey && (isNewPassword || isNewName)){
            try {
                const encryptedPrivateKey = encryptPrivateKey(importedPrivateKey);
                localStorage.setItem(`encryptedPrivateKey_${username}`, encryptedPrivateKey);
            } catch (error) {
                console.log(error);
            }

            handleUpdateProfile(newPassword);
            setPopupMessage("New changes applied.");
            setShowPopup(true);
            setImportedPrivateKey("");
            setCurrentPassword("");
            setNewPassword("");
            return;

        }
        

    };


    const exportPrivateKey = () => {

        const encryptedPrivateKey = localStorage.getItem(`encryptedPrivateKey_${username}`);

        if (!encryptedPrivateKey) {
            setPopupMessage("No private key found in this browser.")
            setShowPopup(true);
            return;
        }

        const privateKey = decryptPrivateKey(encryptedPrivateKey);


        navigator.clipboard.writeText(privateKey)
            .then(() => {
                setPopupMessage("Warning: The private key has been copied to the clipboard. Please ensure to handle it with care and delete it from the clipboard after use.")
                setShowPopup(true);
            })
            .catch((error) => {
                console.error('Unable to copy private key to clipboard.');
            });
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


            {isLoading && (
                <div className="fixed w-full h-full z-40">

                    <div className={`absolute inset-0 bg-white bg-opacity-5 ${isLoading ? 'backdrop-blur-md' : ''}`}></div>
                    <div className={`absolute inset-0 bg-black bg-opacity-5 ${isLoading ? 'backdrop-blur-md' : ''}`}></div>


                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300"></div>
                    </div>

                </div>
            )}


            <div className="bg-black font-sans m-0 pb-[3px]">
                <div className="bg-black shadow">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between py-4">
                            <div>
                                <img src='https://i.postimg.cc/qNH5HLHJ/f-v2.png' border='0' alt='f-v2' className="w-20" />
                            </div>



                            <div className=" sm:flex sm:items-center">
                                <a href="#" className="text-white text-sm font-semibold hover:text-[#cfdf8f] mr-4" onClick={handleSignOut}>Sign out</a>
                                <a href="/" className="text-white text-sm font-semibold border px-4 py-2 rounded-lg hover:text-[#cfdf8f] hover:border-[#cfdf8f]">Return to home</a>
                            </div>


                        </div>


                    </div>
                </div>
            </div>



            <div className="container mx-auto">

                <div className="min-w-full ">

                    <div className="max-w-lg mx-auto mt-8 p-8 rounded-lg shadow-lg ">
                        <div className=" flex items-center justify-center mb-8">
                            <h1 className="text-[#cfdf8f] font-semibold text-2xl">Settings</h1>
                        </div>
                        <div className="mb-4">

                            <input placeholder="Username" type="text" id="name" className="border rounded-lg px-3 py-2 w-full  bg-black border-[#cfdf8f] placeholder-white-500 text-white" value={name} onChange={handleNameChange} readOnly/>
                        </div>

                        <div className="mb-4">

                            <input placeholder="Current password" type="password" id="currentPassword" className="border rounded-lg px-3 py-2 w-full  bg-black border-[#cfdf8f] placeholder-white-500 text-white" value={currentPassword} onChange={handleCurrentPasswordChange} />
                        </div>

                        <div className="mb-4">

                            <input placeholder="New password" type="password" id="newPassword" className="border rounded-lg px-3 py-2 w-full  bg-black border-[#cfdf8f] placeholder-white-500 text-white" value={newPassword} onChange={handleNewPasswordChange} />
                        </div>


                        <div className="mb-4">
                            <textarea placeholder="Import private key" id="importPrivateKey" className="border rounded-lg px-3 py-2 w-full  bg-black border-[#cfdf8f] placeholder-white-500 text-white" value={importedPrivateKey} onChange={handleImportedPrivateKey} />
                        </div>

                        <div className="flex flex-col space-y-4 mt-3">
                            <button onClick={saveChanges} className="bg-[#cfdf8f] text-black rounded-lg py-3 font-semibold" >Save Changes</button>
                            <button onClick={exportPrivateKey} className="bg-[#000000] text-[#cfdf8f] rounded-lg py-3 font-semibold" >Export Private Key</button>
                        </div>

                    </div>






                </div>


            </div>



        </div>
    );
};

export default Home;