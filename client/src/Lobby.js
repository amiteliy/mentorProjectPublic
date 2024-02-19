

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
        const response = await fetch('http://localhost:3000/codeblocks');
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