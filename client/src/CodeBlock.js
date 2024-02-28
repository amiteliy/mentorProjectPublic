import React, { useState, useEffect, useRef  } from 'react';
import { useParams } from 'react-router-dom'; 
import './CodeBlock.css';

import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/nord.css';
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);


const  CodeBlock = () => {
// Get the code block ID from the URL - identify which code block
  const { id } = useParams(); 
  const [code, setCode] = useState('');
  const [isMentor, setIsMentor] = useState(false);
  const [solution, setSolution] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const codeRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = new WebSocket('wss://moveomentor.onrender.com');
      socketRef.current.onopen = () => {
        console.log('Connected to WebSocket');
        socketRef.current.send(JSON.stringify({ type: 'joinRoom', roomId: id }));
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'codeUpdate') {
          setCode(data.code);
        } else if (data.type === 'roleAssigned') {
          setIsMentor(data.role === 'mentor');
        }
      };

      socketRef.current.onclose = () => console.log('Disconnected from WebSocket');
      socketRef.current.onerror = (event) => console.error('WebSocket error:', event);
    }
    

    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, []);


  useEffect(() => {
    console.log('Fetching initial code for code block ID:', id);
    const fetchInitialCode = async () => {
      try {
        console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/CodeBlocks/${id}`);
        if (!response.ok) {
          throw new Error(`Error fetching code block: ${response.statusText}`);
        }
        const text = await response.text(); 
        try {
          const data = JSON.parse(text); 
          setCode(data.code);
          setSolution(data.solution);
        } catch (e) {
          console.error("Could not parse JSON", e);
          console.error("Received text:", text);
        }
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
    console.log(`is mentor  ${isMentor}`);
  }, [isMentor]);
  

  const handleCodeChange = (e) => {
    const updatedCode = e.target.value;
    console.log('Code changed by user:', updatedCode);
    setCode(updatedCode);
    if (!isMentor && socketRef.current) {
      socketRef.current.send(JSON.stringify({ type: 'codeChange', roomId: id, newCode: updatedCode }));
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

