import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../Helper/axiosInstance";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import { Link, useParams } from "react-router-dom";
import io from "socket.io-client";

// Get username from localStorage
const username = localStorage.getItem("name") || "unknown";

// Connect to the Nginx load balancer with a custom X-Forwarded-For header
// const socket = io("http://localhost", {
//   path: "/socket.io/",
//   extraHeaders: {
//     "X-Forwarded-For": username === "rajesh" ? "192.168.1.1" : "192.168.1.2",
//   },
// });

const server = username == 'niroj' ? "localhost:5002" : "localhost:5001";

// alert(username,server)


const socket = io(server, {
    path: "/socket.io/",
    extraHeaders: {
      "X-Forwarded-For": username == "rajesh" ? "192.168.1.1" : "192.168.1.2",
    },
  });


const Delete = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("id");
  const { id } = useParams("id");
  const messagesEndRef = useRef(null);

  const [allMsg, setAllMsg] = useState([]);
  const [msg, setMsg] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMsg]);

  const fetchChats = async (chatId) => {
    try {
      const allChat = await axiosInstance.get(`/message/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllMsg(allChat.data.data.messages);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  // Fetch initial chats on mount
  useEffect(() => {
    fetchChats(id);
  }, [id]);

  // Socket setup
  useEffect(() => {
    // Join the chat room
    socket.emit("joined chat", id);

    // Listen for received messages
    socket.on("recieved_message", (data) => {
      const messageR = {
        content: data.msg,
        sender: {
          _id: data.userId,
        },
      };
      setAllMsg((prevMessages) => [...prevMessages, messageR]);
    });

    // Log connection for debugging
    socket.on("connect", () => {
      console.log(`Connected to load balancer as ${username}`);
    });

    // Handle connection errors
    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    // Cleanup on unmount
    return () => {
      socket.off("recieved_message");
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [id]);

  const handleSend = async () => {
    if (!msg.trim()) return; // Prevent empty messages
    const payload = { message: msg };
    const messageR = {
      content: msg,
      sender: { _id: userId },
    };
    try {
      const sendMsg = await axiosInstance.post(`/message/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      socket.emit("send_message", {
        msg: sendMsg.data.data.newMessage.content,
        id,
        userId,
      });
      setAllMsg((prevMessages) => [...prevMessages, messageR]);
      setMsg("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Flex flexDir={"column"} alignItems={"center"} w="100%" pt="20px" gap="5px">
      <Box
        w="95%"
        h="60px"
        border={"1px solid purple"}
        display={"flex"}
        alignItems={"center"}
        px="7px"
      >
        <Link to="/home/chats">
          <Button colorScheme="purple" borderRadius={"100%"} w="45px" h="45px">
            <MdOutlineArrowBackIosNew color="white" size={25} />
          </Button>
        </Link>
        <Container>
          <Text
            textAlign={"center"}
            fontSize={"22px"}
            fontWeight={"bold"}
            color={"purple"}
          >
            Niraj
          </Text>
        </Container>
      </Box>
      <Flex
        border="2px solid purple"
        w="95%"
        h="350px"
        flexDir={"column"}
        overflowY={"auto"}
        ref={messagesEndRef}
        px="8px"
      >
        {allMsg.map((val, key) => (
          <Box
            key={key}
            maxWidth="45%"
            bg={val.sender._id === userId ? "purple.600" : "purple"}
            alignSelf={val.sender._id === userId ? "flex-end" : "flex-start"}
            borderRadius={"5px"}
            my="5px"
            px="8px"
            py="5px"
          >
            <Text color="white">{val.content}</Text>
          </Box>
        ))}
      </Flex>
      <Box w="95%">
        <InputGroup w="100%">
          <Input
            value={msg}
            type="text"
            onChange={(e) => setMsg(e.target.value)}
            color="purple.400"
            _focus={{ border: "2px solid purple" }}
          />
          <InputRightElement width="100px">
            <Button w="100px" colorScheme="purple" onClick={handleSend}>
              Send
            </Button>
          </InputRightElement>
        </InputGroup>
      </Box>
    </Flex>
  );
};

export default Delete;

























// import React, { useEffect, useRef, useState } from "react";
// import axiosInstance from "../Helper/axiosInstance";
// import { MdOutlineArrowBackIosNew } from "react-icons/md";
// import {
//   Box,
//   Button,
//   Container,
//   Flex,
//   Input,
//   InputGroup,
//   InputRightElement,
//   Text,
// } from "@chakra-ui/react";
// import { Link, useParams } from "react-router-dom";
// import io from "socket.io-client";

// // Dynamically determine the server URL based on the username
// const username = localStorage.getItem("name") || "unknown";
// const serverUrl = username === "rajesh" ? "http://localhost:5001" : "http://localhost:5002";
// const socket = io(serverUrl, {
//   path: "/socket.io/",
// });

// const Delete = () => {
//   const token = localStorage.getItem("token");
//   const userId = localStorage.getItem("id");
//   const { id } = useParams("id");
//   const messagesEndRef = useRef(null);

//   const [allMsg, setAllMsg] = useState([]);
//   const [msg, setMsg] = useState("");

//   const scrollToBottom = () => {
//     messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [allMsg]);

//   const fetchChats = async (chatId) => {
//     try {
//       const allChat = await axiosInstance.get(`/message/${chatId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setAllMsg(allChat.data.data.messages);
//     } catch (error) {
//       console.error("Error fetching chats:", error);
//     }
//   };

//   // Fetch initial chats on mount
//   useEffect(() => {
//     fetchChats(id);
//   }, [id]);

//   // Socket setup
//   useEffect(() => {
//     // Join the chat room
//     socket.emit("joined chat", id);

//     // Listen for received messages
//     socket.on("recieved_message", (data) => {
//       const messageR = {
//         content: data.msg,
//         sender: {
//           _id: data.userId,
//         },
//       };
//       setAllMsg((prevMessages) => [...prevMessages, messageR]);
//     });

//     // Log connection for debugging
//     socket.on("connect", () => {
//       console.log(`Connected to ${serverUrl} as ${username}`);
//     });

//     // Cleanup on unmount
//     return () => {
//       socket.off("recieved_message");
//       socket.off("connect");
//     };
//   }, [id]);

//   const handleSend = async () => {
//     if (!msg.trim()) return; // Prevent empty messages

//     const payload = { message: msg };
//     const messageR = {
//       content: msg,
//       sender: { _id: userId },
//     };

//     try {
//       const sendMsg = await axiosInstance.post(`/message/${id}`, payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       socket.emit("send_message", {
//         msg: sendMsg.data.data.newMessage.content,
//         id,
//         userId,
//       });
//       setAllMsg((prevMessages) => [...prevMessages, messageR]);
//       setMsg("");
//     } catch (error) {
//       console.error("Error sending message:", error);
//     }
//   };

//   return (
//     <Flex flexDir={"column"} alignItems={"center"} w="100%" pt="20px" gap="5px">
//       <Box
//         w="95%"
//         h="60px"
//         border={"1px solid purple"}
//         display={"flex"}
//         alignItems={"center"}
//         px="7px"
//       >
//         <Link to="/home/chats">
//           <Button colorScheme="purple" borderRadius={"100%"} w="45px" h="45px">
//             <MdOutlineArrowBackIosNew color="white" size={25} />
//           </Button>
//         </Link>
//         <Container>
//           <Text
//             textAlign={"center"}
//             fontSize={"22px"}
//             fontWeight={"bold"}
//             color={"purple"}
//           >
//             Niraj
//           </Text>
//         </Container>
//       </Box>
//       <Flex
//         border="2px solid purple"
//         w="95%"
//         h="350px"
//         flexDir={"column"}
//         overflowY={"auto"} // Changed to auto for better scrolling
//         ref={messagesEndRef}
//         px="8px"
//       >
//         {allMsg.map((val, key) => (
//           <Box
//             key={key}
//             maxWidth="45%"
//             bg={val.sender._id === userId ? "purple.600" : "purple"}
//             alignSelf={val.sender._id === userId ? "flex-end" : "flex-start"}
//             borderRadius={"5px"}
//             my="5px"
//             px="8px"
//             py="5px"
//           >
//             <Text color="white">{val.content}</Text>
//           </Box>
//         ))}
//       </Flex>
//       <Box w="95%">
//         <InputGroup w="100%">
//           <Input
//             value={msg}
//             type="text"
//             onChange={(e) => setMsg(e.target.value)}
//             color="purple.400"
//             _focus={{ border: "2px solid purple" }}
//           />
//           <InputRightElement width="100px">
//             <Button w="100px" colorScheme="purple" onClick={handleSend}>
//               Send
//             </Button>
//           </InputRightElement>
//         </InputGroup>
//       </Box>
//     </Flex>
//   );
// };

// export default Delete;