import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom'; // access the URL parameters
import './CodeBlock.css';


import io from 'socket.io-client'; 
const socket = io('http://localhost:3000'); 

const  CodeBlock = () => {
// Get the code block ID from the URL - identify which code block
  const { id } = useParams(); 
  const location = useLocation(); 
  const [code, setCode] = useState('');
  const [isMentor, setIsMentor] = useState(false);


  useEffect(() => {
    console.log(' Code block ID:', id);
  //conect to server
    const fetchInitialCode = async () => {
      console.log('Fetching initial code...');
      try {
        const response = await fetch(`http://localhost:3000/api/CodeBlocks/${id}`); 
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        // client get from the server data fron db - as jason
        const data = await response.json();
        if (data && data.code) {
          setCode(data.code);
        } else {
      console.error('No code found in response:', data);
    }
      } catch (error) {
        console.error("Error fetching initial code:", error.messag);
      }
    };

    if (!location.state || !location.state.code) {
      fetchInitialCode();
    } else {
      setCode(location.state.code);
    }

    //client sent to server -  to get this room 
    socket.emit('joinRoom', id);
   
    //get from server change in code
    socket.on('codeUpdate', (newCode) => {
      console.log('Code updated from socket:', newCode);
      setCode(newCode);
    });

    //get from server the role of the client in the room
    socket.on('roleAssigned', (role) => {
      console.log(`Before setting isMentor, current state is: ${isMentor}`);
      setIsMentor(role !== 'student');
      console.log(`After setting isMentor, new state should be: ${role !== 'student'}`);
    });


  
    return () => {
      socket.off('codeUpdate');
      // socket.off('correctSolution');
      socket.off('roleAssigned');
    };
  }, [id,code, location.state, isMentor]);
  console.log(`is mentor ${isMentor}`);
  

  const handleCodeChange = (e) => {
    const updatedCode = e.target.value;
    console.log('Code changed by user:', updatedCode);
    setCode(updatedCode);
    // Emit code changes only if the user is not a mentor
    if (!isMentor) {
      socket.emit('codeChange', { roomId: id, newCode: updatedCode });
    }
  };
  
  
  return (
    <div key={isMentor ? 'mentor' : 'student'}>
       {isMentor ? 
       (<div>
       <h2> Code block - Code editing is disabled </h2> 
       <textarea
            value={code}
            className="codeEditor"
            readOnly={false}
            />
        </div>
       ) : 
          (<div>
            <h2> Code block  </h2> 
          <textarea
            value={code}
            onChange={handleCodeChange}
            className="codeEditor"
          />
          </div>)}
          {/* <button onClick={handleSubmit} className="submitButton">Submit Code</button> */}
    </div>
  );
};


export default CodeBlock;
