"use client"

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { useRouter } from 'next/navigation';

const Home = () => {

  const router = useRouter();
  const scrollContainerRef = useRef(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [username, setUsername] = useState("");
  const [receiverUsername, setReceiverUsername] = useState("ilyazooo10");
  const [activeConversation, setActiveConversation] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const maxLength = 300;

  useEffect(() => {

    getConnectedUser();
    fetchConversations();


  }, []);


  const handleLoading = () => {
    setIsLoading(true);
  };

  const handleStopLoading = () => {
    setIsLoading(false);
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
        console.log(data.username);
      } else {

        router.push('/login');
      }
    } catch (error) {
      console.log('Erreur lors de la vérification du token :', error);
      router.push('/login');
    }
  };

  /*
    const fetchMessages = async () => {
      //handleLoading();
      alert(receiverUsername);
      try {
        const response = await fetch(`http://localhost:3000/api/messages?senderUsername=${username}&receiverUsername=${receiverUsername}`);
        if (response.ok) {
          const data = await response.json();
          await new Promise(resolve => {
            setMessages(data, resolve);
          });
          scrollToBottom();
        } else {
          console.log('Erreur lors de la récupération des messages');
        }
      } catch (error) {
        console.log('Erreur lors de la requête GET:', error);
      }
      //handleStopLoading();
    };
    */

  const waitOneSecond = () => {
    return new Promise(resolve => {
      setTimeout(resolve, 2000);
    });
  };


  useEffect(() => {

    const fetchMessages = async () => {

      handleLoading();
      try {
        const response = await fetch(`http://localhost:3000/api/messages?senderUsername=${username}&receiverUsername=${receiverUsername}`);
        if (response.ok) {
          const data = await response.json();
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

    };

    fetchMessages();



  }, [receiverUsername]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };


  const fetchConversations = async () => {
    handleLoading();
    try {
      const response = await fetch(`http://localhost:3000/api/conversations?senderUsername=${username}&receiverUsername=${receiverUsername}`);
      if (response.ok) {
        const data = await response.json();
        await setConversations(data);
      } else {
        console.log('Erreur lors de la récupération des messages');
      }
    } catch (error) {
      console.log('Erreur lors de la requête GET:', error);
    }
    handleStopLoading();
  };


  const handleMessageSubmit = async () => {

    if (message.trim() !== '') {
      try {
        const response = await fetch('http://localhost:3000/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderUsername: username,
            receiverUsername: receiverUsername,
            content: message,
            timestamp: new Date().toISOString(),
          }),
        });

        if (response.ok) {
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
      const response = await fetch(`http://localhost:3000/api/messages?senderUsername=${username}&receiverUsername=${receiverUsername}`);
      if (response.ok) {
        const data = await response.json();
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
    if (newMessage.trim() !== '') {
      try {
        const response = await fetch('http://localhost:3000/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderUsername: username,
            receiverUsername: newUsername,
            content: newMessage,
            timestamp: new Date().toISOString(),
          }),
        });

        if (response.ok) {
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


  };


  const setConversation = async (conversation) => {
    //handleLoading();
    setActiveConversation(conversation.receiverUsername);

    await setReceiverUsername(conversation.receiverUsername);

    //await fetchMessages();
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
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="editor mx-auto w-10/12 flex flex-col text-gray-800 p-4 shadow-lg max-w-2xl rounded-md bg-[#cfdf8f]">
            <input
              className="title bg-gray-100 p-2 mb-4 outline-none rounded-md bg-[#000000] text-white"
              spellCheck="false"
              placeholder="Username"
              type="text"
              value={newUsername}
              onChange={handleUsernameChange}
            />
            <textarea
              className="description bg-gray-100 sec p-3 h-60 outline-none rounded-md bg-[#000000] text-white"
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
                className="btn border border-[#000000] border-2 p-1 px-4 font-semibold cursor-pointer text-black ml-auto rounded-lg"
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
                      key={conversation.receiverUsername}
                      className={`flex items-center mb-2 px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-[#cfdf8f] cursor-pointer focus:outline-none border-[1px] rounded-xl hover:bg-[#cfdf8f] hover:text-black ${activeConversation === conversation.receiverUsername ? 'bg-[#cfdf8f] text-black' : 'text-white'
                        }`}
                      onClick={() => setConversation(conversation)}
                    >
                      <img className="object-cover w-10 h-10 rounded-full" src="https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg" alt="Avatar" />
                      <div className="w-full pb-2">
                        <div className="flex justify-between">
                          <span className="block ml-2 font-semibold">{conversation.receiverUsername}</span>
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
            <div className=" lg:col-span-2 lg:block rounded-xl p-5 z-10">
              <div className="w-full  rounded-xl p-5">
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

                <div className="flex items-center justify-between w-full p-3 ">


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