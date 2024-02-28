

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './lobby.css';

const Lobby = () => {
  const [codeBlocks, setCodeBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('API URL:', process.env.REACT_APP_API_URL);
        const apiUrl = process.env.REACT_APP_API_URL || 'https://moveomentor.onrender.com/api';
        const response = await fetch(`${apiUrl}/CodeBlocks`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCodeBlocks(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container">
      <h2>Choose Code Block</h2>
      <ul>
        {codeBlocks.map(block => (
          <li key={block.codeBlockId}>
            <Link to={`/editor/${block.codeBlockId}`} state={{ code: block.code }}>
              {block.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
