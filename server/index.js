
//Express framework -  Node.js web application framework
const express = require('express');
// create an HTTP server
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
//mports the CodeBlock model from db.js
const { CodeBlock } = require('./db'); 

mongoose.connect('mongodb://127.0.0.1:27017/mentorProject', {
  useNewUrlParser: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


  const newCodeBlocks = [
    { codeBlockId: 1, title: 'Async Case',code: `Asynchronous functions allow you to perform long 
    network requests without freezing the user interface.
     In JavaScript,await expressions is used to define an asynchronous function
     JavaScript is single-threaded and by using setTimeout,
     allows you to delay a function's execution for a specified time.
        // Task : Log "Hello, JavaScript!" to the console after a 2-second delay.
        function delayedGreeting() {
            setTimeout(function() {
          // TODO: Use setTimeout to delay the execution of the function
            }
        }
    }`},
    { codeBlockId: 2, title: 'Sorting Algorithms' ,code:`Sorting algorithms are techniques to reorder elements in a list in a specific order.
     Bubble Sort is one of the simplest sorting algorithms that repeatedly steps through the list, compares adjacent elements, 
     and swaps them if they are in the wrong order
        // Task: Implement Bubble Sort to sort the array in ascending order.

function bubbleSort(arr) {
  let n = arr.length;
  // TODO: Implement the bubble sort algorithm.
}
    }`},
    { codeBlockId: 3, title: 'Object-Oriented Programming',code:`Object-Oriented Programming is a programming paradigm based on the concept of "objects",
     which contain data (fields) and methods.
     For example, a class that represents a person and has an ID and a method of writing his ID 
       // Task: Define a class named Rectangle with a constructor that takes the width and height of the rectangle as arguments. 
       Add a method named area that returns the area of the rectangle
       class Rectangle {
        constructor(width, height) {
          //TODO
        }
      
        area() {
            //TODO
        }
      }
   }` },
    { codeBlockId: 4, title: 'map() method' ,code:` map() method in JavaScript creates a new array populated with the results 
    of calling a provided function on every element in the calling array
    // Task: Use the map() method to create a new array with all names in uppercase.
            const names = ['amit', 'inbar', 'noa'];
          // TODO
          ` },
  ];



  CodeBlock.insertMany(newCodeBlocks)
  .then(savedCodeBlocks => {
      console.log('Code blocks saved successfully:', savedCodeBlocks);
  })
  .catch(error => {
      console.error('Error saving code blocks:', error);
    });



const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: (origin, callback) => {
      if (origin && origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});


const cors = require('cors');
app.use(express.static('path/to/your/react-app/build'));
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.get('/codeblocks', async (req, res) => {
  try {
      const codeBlocks = await CodeBlock.find();
      res.json(codeBlocks);
  } catch (error) {
      console.error('Error retrieving code blocks:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
})


app.get('/api/CodeBlocks/:id', async (req, res) => {
  console.log(`Fetching code block with ID: ${req.params.id}`);
  const codeBlockId = req.params.id;
  try {
    const codeBlock = await CodeBlock.findOne({ codeBlockId: codeBlockId });
    if (!codeBlock) {
      console.log('CodeBlock not found');
      return res.status(404).send('CodeBlock not found');
      
    }
    console.log('CodeBlock found:', codeBlock);
    res.json(codeBlock);
  } catch (error) {
    console.error("Error fetching code block:", error);
    res.status(500).send('Error fetching code block');
  }
});




io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', async (roomId) => {
    console.log(`User joined room: ${roomId}`);
    socket.join(roomId);
    const room = io.sockets.adapter.rooms.get(roomId);
    const isMentor = room && room.size === 1;
    console.log(`User role: ${isMentor ? 'Mentor' : 'Student'}`)

    socket.emit('roleAssigned', isMentor ? 'mentor' : 'student');
    console.log(`Role assigned to user in room ${roomId}: ${isMentor ? 'mentor' : 'student'}`);

   
    try {
      const currentCodeBlock = await CodeBlock.findOne({ codeBlockId: roomId });      if (currentCodeBlock) {
        io.to(roomId).emit('codeUpdate', currentCodeBlock.code);
        socket.emit('codeUpdate', currentCodeBlock.code);
      }
    } catch (error) {
      console.error('Error fetching code block:', error);
    }
    
    console.log(`User joined room ${roomId} as ${isMentor ? 'mentor' : 'student'}`);
  });

  
  socket.on('codeChange', ({ roomId, newCode }) => {
    socket.to(roomId).emit('codeUpdate', newCode);
  });

  
});

// port number on which the server listen for requests
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


