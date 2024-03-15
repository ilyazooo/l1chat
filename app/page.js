"use client"

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import crypto from 'crypto';
import forge from 'node-forge';
import { useRouter } from 'next/navigation';
import { encryptPrivateKey, decryptPrivateKey } from '../utils/cryptoUtils.js';

const Home = () => {

  const router = useRouter();
  const scrollContainerRef = useRef(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [username, setUsername] = useState("");
  const [receiverUsername, setReceiverUsername] = useState("");
  const [activeConversation, setActiveConversation] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");



  const maxLength = 300;

  useEffect(() => {

    const fetchData = async () => {
      await getConnectedUser();
    };
    fetchData();

  }, []);


  useEffect(() => {

    const fetchData = async () => {

      if (username != '') {
        await fetchConversations();
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




  const handleUsernameChange = (event) => {
    setNewUsername(event.target.value);
  };

  const handleMessageChange = (event) => {
    const inputValue = event.target.value;
    const currentLength = inputValue.length;

    if (currentLength <= maxLength) {
      setNewMessage(inputValue);
      setCharCount(currentLength);
    }
  };


  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };


  const getConnectedUser = async () => {
    const authToken = localStorage.getItem('authToken');

    try {

      const response = await fetch('../api/valideToken', {
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

  const encryptMessage = (message, publicKey) => {
    const encryptedBuffer = crypto.publicEncrypt({
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, Buffer.from(message));

    return encryptedBuffer.toString('hex');
  };

  // Fonction pour déchiffrer un message avec la clé privée
  const decryptMessage = (encryptedHexMessage, privateKey) => {
    const encryptedBuffer = Buffer.from(encryptedHexMessage, 'hex');
    const decryptedBuffer = crypto.privateDecrypt({
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, encryptedBuffer);

    return decryptedBuffer.toString();
  };




  useEffect(() => {

    const fetchMessages = async () => {

      handleLoading();
      try {
        const encryptedPrivateKey = localStorage.getItem(`encryptedPrivateKey_${username}`);
        const privateKey = decryptPrivateKey(encryptedPrivateKey);

        const response = await fetch(`../api/messages?senderUsername=${username}&receiverUsername=${receiverUsername}`);

        if (response.ok) {
          const data = await response.json();

          data.forEach(item => {
            item.content = decryptMessage(item.content, privateKey);
          });

          setMessages(data);
          scrollToBottom();
        } else {
          console.log('Erreur lors de la récupération des messages');
        }
      } catch (error) {
        console.log('Erreur lors de la requête GET:', error);
      }

      await waitOneSecond();
      handleStopLoading();
      scrollToDiv();

    };

    fetchMessages();
    

  }, [receiverUsername]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };


  const fetchConversations = async () => {
    handleLoading();

    try {
      const response = await fetch(`../api/conversations?senderUsername=${username}`);
      if (response.ok) {
        const data = await response.json();

        const encryptedPrivateKey = localStorage.getItem(`encryptedPrivateKey_${username}`);
        const privateKey = decryptPrivateKey(encryptedPrivateKey);


        data.forEach(item => {
          item.preview = decryptMessage(item.preview, privateKey);
        });

        await setConversations(data);
      } else {
        console.log('Erreur lors de la récupération des messages');
      }
    } catch (error) {
      console.log('Erreur lors de la requête GET:', error);
    }
    handleStopLoading();
  };


  const fetchPublicKey = async (receiverUsername) => {
    try {
      const response = await fetch(`../api/getPublicKey?receiverUsername=${receiverUsername}`);
      if (!response.ok) {
        throw new Error('Failed to fetch public key');
      }
      const data = await response.json();
      return data.publicKey;
    } catch (error) {
      console.error('Error fetching public key:', error);
      return null;
    }
  };

  async function checkExistingUser(username) {
    try {
      // Appel de l'API pour vérifier si l'utilisateur existe
      const response = await fetch(`../api/checkExistingUser?username=${username}`);

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




  const handleMessageSubmit = async () => {

    if (message.trim() !== '') {

      const publicKey = await fetchPublicKey(receiverUsername);
      const encryptedMessage = encryptMessage(message, publicKey);


      const publicKey2 = await fetchPublicKey(username);
      const encryptedMessage2 = encryptMessage(message, publicKey2);


      try {
        const response = await fetch('../api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderUsername: username,
            receiverUsername: receiverUsername,
            content: encryptedMessage,
            timestamp: new Date().toISOString(),
            cryptedFromKeyOf: receiverUsername,
          }),
        });

        const response2 = await fetch('../api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderUsername: username,
            receiverUsername: receiverUsername,
            content: encryptedMessage2,
            timestamp: new Date().toISOString(),
            cryptedFromKeyOf: username,
          }),
        });


        if (response.ok && response2.ok) {
          setMessage('');
          console.log('Message envoyé avec succès');
          scrollToBottom();
        } else {
          console.error('Erreur lors de l\'envoi du message');
        }
      } catch (error) {
        console.error('Erreur lors de la requête POST:', error);
      }
    } else {
      console.warn('Le message est vide');
    }

    //await fetchMessages();
    handleLoading();

    try {
      const encryptedPrivateKey = localStorage.getItem(`encryptedPrivateKey_${username}`);
      const privateKey = decryptPrivateKey(encryptedPrivateKey);

      const response3 = await fetch(`../api/messages?senderUsername=${username}&receiverUsername=${receiverUsername}`);

      if (response3.ok) {
        const data = await response3.json();


        data.forEach(item => {
          item.content = decryptMessage(item.content, privateKey);
        });



        setMessages(data);
        scrollToBottom();
      } else {
        console.log('Erreur lors de la récupération des messages');
      }
    } catch (error) {
      console.log('Erreur lors de la requête GET:', error);
    }

    await waitOneSecond();
    handleStopLoading();
    await fetchConversations();

  };


  const handleNewMessageSubmit = async () => {
    handleLoading();
    if (newMessage.trim() !== '') {

      if (await checkExistingUser(newUsername) == false) {
        setPopupMessage("This user doesn't exist")
        setShowPopup(true);
        return;
      }
      const publicKey = await fetchPublicKey(newUsername);
      const encryptedMessage = await encryptMessage(newMessage, publicKey);

      const publicKey2 = await fetchPublicKey(username);
      const encryptedMessage2 = encryptMessage(newMessage, publicKey2);

      try {
        const response = await fetch('../api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderUsername: username,
            receiverUsername: newUsername,
            content: encryptedMessage,
            timestamp: new Date().toISOString(),
            cryptedFromKeyOf: newUsername,
          }),
        });

        const response2 = await fetch('../api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderUsername: username,
            receiverUsername: newUsername,
            content: encryptedMessage2,
            timestamp: new Date().toISOString(),
            cryptedFromKeyOf: username,
          }),
        });

        if (response.ok && response2.ok) {
          setMessage('');
          console.log('Message envoyé avec succès');
          scrollToBottom();
        } else {
          console.error('Erreur lors de l\'envoi du message');
        }
      } catch (error) {
        console.error('Erreur lors de la requête POST:', error);
      }
    } else {
      console.warn('Le message est vide');
    }

    await fetchConversations();
    setNewMessage("");
    setNewUsername("");

    toggleVisibility();
    handleStopLoading();
  };


  const scrollToDiv = () => {
    const element = document.getElementById('Conversation'); 
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  


  const setConversation = async (conversation) => {
    //handleLoading();
    setActiveConversation(username === conversation.receiverUsername ? conversation.senderUsername : conversation.receiverUsername);
    await setReceiverUsername(username === conversation.receiverUsername ? conversation.senderUsername : conversation.receiverUsername);
    //await fetchMessages();
    //scrollToDiv();
    scrollToBottom();
    //handleStopLoading();

  };

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };


  useEffect(() => {

    scrollToBottom();
  }, [messages]);


  return (
    <div>

{showPopup && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50 bg-gray-500 bg-opacity-50">
          <div className="relative bg-[#000000] rounded-lg shadow p-5 m-5">
            <button type="button" onClick={handlePopupClose} className="absolute top-3 end-2.5 text-[#cfdf8f] bg-transparent hover:bg-[#cfdf8f] hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" >
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
              
            </button>
            <div className="p-4 md:p-5 text-center">
              <svg className="mx-auto mb-4 text-[#cfdf8f] w-12 h-12 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
              </svg>
              <h3 className=" text-lg font-normal text-[#cfdf8f] ">{popupMessage}</h3> 
              
            </div>
          </div>
        </div>
      )}


      {isLoading && (
        <div className="fixed w-full h-full z-50">

          <div className={`absolute inset-0 bg-white bg-opacity-5 ${isLoading ? 'backdrop-blur-md' : ''}`}></div>
          <div className={`absolute inset-0 bg-black bg-opacity-5 ${isLoading ? 'backdrop-blur-md' : ''}`}></div>


          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300"></div>
          </div>

        </div>
      )}




      {isVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-40">
          <div className="editor mx-auto w-10/12 flex flex-col text-gray-800 p-4 shadow-lg max-w-2xl rounded-md bg-[#cfdf8f]">
            <input
              className="title p-2 mb-4 outline-none rounded-md bg-[#000000] text-white"
              spellCheck="false"
              placeholder="Username"
              type="text"
              value={newUsername}
              onChange={handleUsernameChange}
            />
            <textarea
              className="description sec p-3 h-60 outline-none rounded-md bg-[#000000] text-white"
              spellCheck="false"
              placeholder="Message"
              value={newMessage}
              onChange={handleMessageChange}
              maxLength={maxLength}
            ></textarea>

            <div className="icons flex text-gray-500 m-2 pb-3">
              <div className="count ml-auto text-black text-xs font-semibold">
                {charCount}/{maxLength}
              </div>
            </div>

            <div className="buttons flex">
              <div
                className="btn p-1 px-4 font-semibold cursor-pointer text-black ml-auto rounded-lg"
                onClick={toggleVisibility}
              >
                Cancel
              </div>
              <div className="btn p-1 px-4 font-semibold cursor-pointer text-white ml-2 bg-[#000000] rounded-lg" onClick={handleNewMessageSubmit}>
                Send
              </div>
            </div>
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
                <a href="/profile" className="text-white text-sm font-semibold border px-4 py-2 rounded-lg hover:text-[#cfdf8f] hover:border-[#cfdf8f]">My profile</a>
              </div>


            </div>


          </div>
        </div>
      </div>



      <div className="container mx-auto">

        <div className="min-w-full  lg:grid lg:grid-cols-3">
          <div className=" border-gray-300 lg:col-span-1 p-5">
            <div className=" my-3 p-6">
              <button type="button" onClick={toggleVisibility} className="text-gray-900 bg-gradient-to-r from-teal-200 to-[#cfdf8f] hover:bg-gradient-to-l hover:from-teal-200 hover:to-[#cfdf8f]  rounded text-sm px-5 pl-3 py-2.5 text-center font-semibold">+ New conversation  &nbsp;&nbsp;&nbsp;  </button>
            </div>

            <ul className="overflow-auto max-h-[32rem] p-4">
              <h2 className=" mb-2 ml-2 text-lg text-white">Chats</h2>
              <li className="p-2">


                <div>
                  {conversations.map(conversation => (
                    <a
                      key={username === conversation.receiverUsername ? conversation.senderUsername : conversation.receiverUsername}
                      className={`flex items-center mb-2 px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-[#cfdf8f] cursor-pointer focus:outline-none border-[1px] rounded-xl hover:bg-[#cfdf8f] hover:text-black ${activeConversation === conversation.receiverUsername ? 'bg-[#cfdf8f] text-black' : 'text-white'
                        }`}
                      onClick={() => setConversation(conversation)}
                    >
                      <img className="object-cover w-10 h-10 rounded-full" src="https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg" alt="Avatar" />
                      <div className="w-full pb-2">
                        <div className="flex justify-between">
                          <span className="block ml-2 font-semibold">

                            {username === conversation.receiverUsername ? conversation.senderUsername : conversation.receiverUsername}
                          </span>
                          <span className="block ml-2 text-sm">{conversation.lastMessage} Minutes</span>
                        </div>
                        <span className="block ml-2 text-sm">{conversation.preview}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </li>
            </ul>
          </div>

          {activeConversation && (
            <div   className=" lg:col-span-2 lg:block rounded-xl p-5 z-10">
              <div  className="w-full  rounded-xl p-5">
                <div className="relative flex items-center p-3  rounded-xl justify-center">

                  <img className="object-cover w-10 h-10 rounded-full"
                    src="https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg" alt="username" />
                  <span className="block ml-2 font-bold text-white">{receiverUsername}</span>

                </div>
                <div className="relative w-full p-6 overflow-y-auto h-[32rem]  " ref={scrollContainerRef}>
                  <ul className="space-y-2">

                    {messages.map((message) => (
                      <li key={message._id} className={`flex ${message.senderUsername === username ? 'justify-end' : 'justify-start'}`}>
                        <div className={`relative max-w-xl px-4 py-2 text-gray-700 ${message.senderUsername === username ? 'bg-gray-100' : 'bg-[#cfdf8f]'} rounded shadow`}>
                          <span className="block">{message.content}</span>
                        </div>
                      </li>
                    ))}



                  </ul>
                </div>

                <div id="Conversation" className="flex items-center justify-between w-full p-3 ">


                  <input
                    type="text"
                    placeholder="Message"
                    className="block w-full py-2 pl-4 bg-gray-100 rounded-xl outline-none text-black"
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />

                  <button type="submit" onClick={handleMessageSubmit}>
                    <svg className="w-5 h-5 text-gray-100 origin-center transform rotate-90 ml-5" xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20" fill="currentColor">
                      <path
                        d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>





                </div>
              </div>
            </div>
          )}
        </div>
      </div>



    </div>
  );
};

export default Home;