import React, { useState, useEffect, useRef  } from 'react';
import { useParams, useLocation } from 'react-router-dom'; 
import './CodeBlock.css';

import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/nord.css';
import javascript from 'highlight.js/lib/languages/javascript';


import io from 'socket.io-client'; 
// const socket = io('http://localhost:3000');
const socket = new WebSocket('https://mentorprojectamit.netlify.app'); 
hljs.registerLanguage('javascript', javascript);


const  CodeBlock = () => {
// Get the code block ID from the URL - identify which code block
  const { id } = useParams(); 
  const location = useLocation(); 
  const [code, setCode] = useState('');
  const [isMentor, setIsMentor] = useState(false);
  const [solution, setSolution] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const codeRef = useRef(null);


  useEffect(() => {
    console.log('Fetching initial code for code block ID:', id);
    const fetchInitialCode = async () => {
      try {
        const response = await fetch(`https://mentorprojectamit.netlify.app/CodeBlocks/${id}`)
        // const response = await fetch(`http://localhost:3000/api/CodeBlocks/${id}`);
        if (!response.ok) {
          throw new Error(`Error fetching code block: ${response.statusText}`);
        }
        const data = await response.json();
        setCode(data.code);
        setSolution(data.solution);
      } catch (error) {
        console.error("Error fetching initial code:", error.message);
      }
    };

    fetchInitialCode();
  }, [id]);


  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
      console.log('Highlighting code block:', codeRef.current);
        const normalizedCode = normalizeCode(code);
        const normalizedSolution = normalizeCode(solution);
        console.log('normalizedCod:', normalizedCode);
        console.log('normalizedSolution:', normalizedSolution);
        setIsCorrect(normalizedCode !== null && normalizedCode === normalizedSolution);
        console.log('solution stat:', normalizedCode === normalizedSolution);
      
    }
  }, [code,setSolution]);

  


  useEffect(() => {
    socket.emit('joinRoom', id);

    socket.on('codeUpdate', newCode => {
      console.log('Code updated from socket:', newCode);
      setCode(newCode);
      hljs.highlightElement(codeRef.current);
    });

    socket.on('roleAssigned', (role) => {
      console.log(`Before setting isMentor, current state is: ${isMentor}`);
      setIsMentor(role !== 'student');
      console.log(`After setting isMentor, new state should be: ${role !== 'student'}`);
          });


    return () => {
      socket.off('codeUpdate');
      socket.off('roleAssigned');
    };
  }, [id,code, location.state, isMentor]);
  console.log(`is mentor ${isMentor}`);


  const handleCodeChange = (e) => {
    const updatedCode = e.target.value;
    console.log('Code changed by user:', updatedCode);
    setCode(updatedCode);
    if (!isMentor) {
      socket.emit('codeChange', { roomId: id, newCode: updatedCode });
    }
  };
  
  
  return (
    <div className="codeBlockContainer">
      <h2>Code Block - {isMentor ? "Code editing is disabled" : "Edit your code"}</h2>
      {isCorrect && <div className="solutionCorrect">Correct Solution! 😃</div>}
      <pre className="preCode"><code ref={codeRef} className="javascript hljs">{code}
      
        </code></pre>
      {!isMentor && (
        <>
        <textarea
          className="codeEditor"
          value={code}
          onChange={handleCodeChange} 
        />
         </>
      )}
    </div>
  );
  


};

function normalizeCode(str) {
  if (!str || typeof str !== 'string'|| str == '') return null;
  return str.replace(/\s+/g, '');
}


export default CodeBlock;

