import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Todo from './Todo'; // Hum apne purane Todo code ko Todo.js mein move karenge

function App() {

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                {/* YE LINE SABSE ZAROORI HAI */}
                <Route path="/todo" element={<Todo />} />

                {/* Default page login par rakhein */}
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;