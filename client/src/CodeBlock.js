import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom'; // access the URL parameters
import './CodeBlock.css';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/nord.css';
import javascript from 'highlight.js/lib/languages/javascript';

// Imports the Socket.IO client
import io from 'socket.io-client'; 

// Connect to the server
const socket = io('http://localhost:3000'); 


const  CodeBlock = () => {
// Get the code block ID from the URL - identify which code block
  const { id } = useParams(); 
  const location = useLocation(); 
  const [code, setCode] = useState('');
  const [isMentor, setIsMentor] = useState(false);


  hljs.registerLanguage('javascript', javascript);

  const handleCodeChange = (e) => {
    const updatedCode = e.target.value;
    console.log('Code changed by user:', updatedCode);
    setCode(updatedCode);
    // Emit code changes only if the user is not a mentor
    if (!isMentor) {
      socket.emit('codeChange', { roomId: id, newCode: updatedCode });
    }
  };
  

  const handleSubmit = () => {
    console.log('Submitting code...');
    if (!isMentor) {
      socket.emit('submitCode', { roomId: id, studentCode: code });
    }
  };

  
  useEffect(() => {
    console.log('Component mounted. Code block ID:', id);
  hljs.highlightAll();
   
    const fetchInitialCode = async () => {
      console.log('Fetching initial code...');
      try {
        const response = await fetch(`http://localhost:3000/api/CodeBlocks/${id}`); 
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
      setCode(data.code);
        if (data && data.code) {
          setCode(data.code);
          hljs.highlightAll();
        } else {
      console.error('No code found in response:', data);
    }
      } catch (error) {
        console.error("Error fetching initial code:", error.messag);
      }
    };

    if (!location.state || !location.state.code) {
      console.log("@@@@@@@");
      fetchInitialCode();
    } else {
      console.log("$$$$$$");
      setCode(location.state.code);
      
    }

    socket.emit('joinRoom', id);
   
    //reflecting changes made by other users in real-time.
    socket.on('codeUpdate', (newCode) => {
      console.log('Code updated from socket:', newCode);
      setCode(newCode);
     hljs.highlightAll();
    });

    // Listen for role assignment
    socket.on('roleAssigned', (role) => {
      console.log(`Before setting isMentor, current state is: ${isMentor}`);
      setIsMentor(role !== 'student');
      console.log(`After setting isMentor, new state should be: ${role !== 'student'}`);
    });


    //Bonus
    socket.on('correctSolution', ({ correct }) => {
        if (correct) {
          alert("Correct solution! 😊");
        } else {
          alert("Keep trying!");
        }
    });



    //turns off the codeUpdate event listener
    return () => {
      console.log('Component unmounting. Cleaning up listeners...')
      socket.off('codeUpdate');
      socket.off('correctSolution');
      socket.off('roleAssigned');
    };
  }, [id,code, location.state, isMentor]);
  console.log(`is mentor ${isMentor}`);
  

 
  
  return (
    <div>
       {isMentor ? (<h2> Code block - You are viewing this code block as a mentor. Code editing is disabled </h2> ) : (<h2> Code block </h2>)}
      <>
          <textarea
            value={code}
            onChange={handleCodeChange}
            className="codeEditor"
            readOnly={isMentor}
          />
          <button onClick={handleSubmit} className="submitButton">Submit Code</button>
        </>
    </div>
  );
};


export default CodeBlock;
