/*import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
   // const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/auth/login', formData);
            
            // Backend se milne wala data (token aur user details) save karein
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            alert("Login Successful!");
            window.location.href = "/"; // Page reload karke home par bhejne ke liye
        } catch (err) {
            alert(err.response?.data?.msg || "Login Failed");
        }
    };

    return (
        <div className="todo-container">
            <form className="todo-card" onSubmit={handleLogin}>
                <h2>Welcome Back</h2>
                <input 
                    type="email" 
                    placeholder="Email" 
                    className="todo-input"
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    className="todo-input"
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    required 
                />
                <button type="submit" className="add-btn">Login</button>
                <p onClick={() => navigate('/signup')} style={{cursor:'pointer', marginTop:'10px'}}>
                    Don't have an account? Signup
                </p>
            </form>
        </div>
    );
}

export default Login;*/

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css'; // Dono ke liye common CSS

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/auth/login', { email, password })
            .then(res => {
                // Check karein ki response mein kya aa raha hai
                console.log("Login Response:", res.data);

                // User data aur token dono save karein
                localStorage.setItem('user', JSON.stringify(res.data.user));
                localStorage.setItem('token', res.data.token);

                // Phir navigate karein
                navigate('/todo');
            })
            .catch(err => alert(err.response?.data?.msg || "Login Failed"));
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Please enter your details to login</p>
                </div>
                <form onSubmit={handleLogin} className="auth-form">
                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-btn">Sign In</button>
                </form>
                <p className="auth-footer">
                    Don't have an account? <Link to="/signup">Create Account</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;