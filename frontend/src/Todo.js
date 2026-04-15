import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // Table support ke liye
import './App.css';

function Todo() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null); // Track karne ke liye ki kaunsa edit ho raha hai

    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    // Agar user nahi hai, toh wapas login par bhej do
    useEffect(() => {
        if (!user) {
            window.location.href = "/login";
        }
    }, [user]);

    // 1. Fetch Tasks Logic
    const fetchTasks = useCallback(() => {
        if (user && user.id) {
            axios.get(`http://localhost:5000/tasks/${user.id}`)
                .then(res => setTasks(res.data))
                .catch(err => console.log("Fetch Error:", err));
        }
        // Ye niche wali line add karne se warning hamesha ke liye chali jayegi
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    // 2. Add Task Logic (Corrected & Debugged)
    const addTask = () => {
        console.log("Adding Note - Title:", title);
        console.log("Adding Note - Description:", description);

        if (title && user) {
            axios.post('http://localhost:5000/tasks', {
                title: title,           // Heading
                description: description, // Details (Make sure spelling is same as backend)
                userId: user.id
            })
                .then(res => {
                    console.log("Server Saved:", res.data);
                    setTasks([res.data, ...tasks]);
                    setTitle('');       // Headline clear karein
                    setDescription(''); // Details clear karein
                })
                .catch(err => {
                    console.log("Error details:", err.response?.data);
                    alert("Kuch gadbad hui!");
                });
        } else {
            alert("Title likhna zaroori hai!");
        }
    };
    const deleteTask = (id) => {
        axios.delete(`http://localhost:5000/tasks/${id}`)
            .then(() => setTasks(tasks.filter(t => t._id !== id)))
            .catch(err => console.log(err));
    };

    // 1. Edit mode on karne ke liye
    const startEdit = (task) => {
        setEditingId(task._id);
        setTitle(task.title);
        setDescription(task.description);
        window.scrollTo(0, 0); // User ko upar le jao taaki wo edit kar sake
    };

    // 2. Updated data save karne ke liye
    const updateTask = () => {
    if (title && editingId) {
        axios.put(`http://localhost:5000/tasks/${editingId}`, { title, description })
        .then(res => {
            // 1. List ko update karein
            const updatedTasks = tasks.map(t => t._id === editingId ? res.data : t);
            setTasks(updatedTasks);
            
            // 2. Form ko clear karein
            setEditingId(null);
            setTitle('');
            setDescription('');
            
            alert("Note updated successfully! ✅");
        })
        .catch(err => {
            console.error("Update fail detail:", err.response);
            alert("Update nahi ho paya, backend check karein!");
        });
    }
};

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="main-layout">
            <div className="header-nav-new">
                <span>Welcome, <strong>{user?.name || 'Guest'}</strong> 👋</span>
                <span className="logout-link" onClick={handleLogout}>Logout</span>
            </div>

            <div className="content-container">
                {/* LEFT SIDE: INPUT */}
                <div className="input-sidebar">
                    <h2 className="section-title">➕ Add New Note</h2>

                    <div className="stats-container">
                        <div className="stat-item">
                            <span className="stat-label">Total</span>
                            <span className="stat-value">{tasks.length}</span>
                        </div>
                    </div>

                    <input
                        className="todo-input-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Task Headline..."
                    />
                    <textarea
                        className="todo-textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)} // Connection check
                        placeholder="Add details (You can use tables or paragraphs here...)"
                        rows="8"
                    />
                    <button
                        className={editingId ? "update-btn-large" : "add-btn-large"}
                        onClick={editingId ? updateTask : addTask}
                    >
                        {editingId ? "Update Note" : "Save Note"}
                    </button>

                    {/* Agar edit cancel karna ho */}
                    {editingId && (
                        <button className="cancel-btn" onClick={() => {
                            setEditingId(null); setTitle(''); setDescription('');
                        }}>Cancel Edit</button>
                    )}

                </div>

                {/* RIGHT SIDE: LIST */}
                <div className="task-list-container">
                    <h2 className="section-title">📋 Your Saved Notes</h2>
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-bar"
                            placeholder="🔍 Search notes..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="task-grid">
                        {filteredTasks.map(task => (
                            <div key={task._id} className="task-card-new">
                                {/* Header: Title aur Buttons ek hi line mein */}
                                <div className="card-header">
                                    <h4 className="card-title">{task.title}</h4>
                                    <div className="card-actions">
                                        {/* Edit Button */}
                                        <button className="edit-btn-card" onClick={() => startEdit(task)}>✎</button>
                                        {/* Delete Button */}
                                        <button className="delete-btn-card" onClick={() => deleteTask(task._id)}>✕</button>
                                    </div>
                                </div>

                                {/* Body: Markdown Description */}
                                <div className="card-body">
                                    <div className="card-description">
                                        {task.description ? (
                                            <ReactMarkdown>{String(task.description)}</ReactMarkdown>
                                        ) : (
                                            <p style={{ color: '#ff4d4d', fontSize: '13px' }}>No details found in database</p>
                                        )}
                                    </div>
                                </div>

                                {/* Footer: Date display */}
                                <div className="card-footer">
                                    <small>
                                        {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "New Task"}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div >
        </div >

    );
}

export default Todo;