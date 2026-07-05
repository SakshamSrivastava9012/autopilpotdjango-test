import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Lock, 
  User, 
  Mail, 
  LogOut, 
  PlusCircle, 
  Trash2, 
  Search, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import './App.css';

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  // View State: 'login' | 'register' | 'dashboard'
  const [view, setView] = useState(token ? 'dashboard' : 'login');

  // Notes State
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form States - Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Form States - Register
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // Form States - Note Creation
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteError, setNoteError] = useState('');
  const [noteSuccess, setNoteSuccess] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  // Load notes on dashboard load
  useEffect(() => {
    if (token && view === 'dashboard') {
      fetchNotes();
    }
  }, [token, view]);

  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const response = await fetch(`${API_URL}/notes/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      } else {
        // Token might have expired or deleted on server
        if (response.status === 401) {
          handleSessionExpired();
        }
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleSessionExpired = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
    setView('login');
    setLoginError('Session expired. Please log in again.');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    if (!loginUsername || !loginPassword) {
      setLoginError('Please fill in all fields.');
      setLoginLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setCurrentUser(data.user);
        setView('dashboard');
        
        // Reset login form
        setLoginUsername('');
        setLoginPassword('');
      } else {
        setLoginError(data.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setLoginError('Unable to connect to the backend server. Make sure your server is running.');
      console.error('Login error:', err);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterLoading(true);

    if (!registerUsername || !registerEmail || !registerPassword || !registerConfirmPassword) {
      setRegisterError('All fields are required.');
      setRegisterLoading(false);
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Passwords do not match.');
      setRegisterLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterError('Password must be at least 6 characters long.');
      setRegisterLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: registerUsername,
          email: registerEmail,
          password: registerPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setRegisterSuccess('Registration successful! Logging you in...');
        
        // Auto-login after registration
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setCurrentUser(data.user);
        
        // Delay redirect slightly for UX
        setTimeout(() => {
          setView('dashboard');
          setRegisterSuccess('');
          setRegisterUsername('');
          setRegisterEmail('');
          setRegisterPassword('');
          setRegisterConfirmPassword('');
        }, 1500);

      } else {
        // Format error messages from serializer
        let errorMsg = 'Registration failed. ';
        if (data.username) errorMsg += `Username: ${data.username[0]} `;
        if (data.email) errorMsg += `Email: ${data.email[0]} `;
        if (data.password) errorMsg += `Password: ${data.password[0]} `;
        if (typeof data === 'object' && !data.username && !data.email && !data.password) {
          errorMsg += Object.values(data).flat().join(' ');
        }
        setRegisterError(errorMsg);
      }
    } catch (err) {
      setRegisterError('Failed to connect to backend server.');
      console.error('Registration error:', err);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });
    } catch (err) {
      console.error('Logout error on server:', err);
    } finally {
      // Clear local storage anyway
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setCurrentUser(null);
      setView('login');
      setNotes([]);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    setNoteError('');
    setNoteSuccess('');
    setNoteLoading(true);

    if (!noteTitle.trim() || !noteContent.trim()) {
      setNoteError('Title and content are required.');
      setNoteLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/notes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent
        })
      });

      const data = await response.json();

      if (response.ok) {
        setNotes((prevNotes) => [data, ...prevNotes]);
        setNoteTitle('');
        setNoteContent('');
        setNoteSuccess('Note added successfully!');
        
        setTimeout(() => setNoteSuccess(''), 3000);
      } else {
        if (response.status === 401) {
          handleSessionExpired();
        } else {
          setNoteError('Failed to create note.');
        }
      }
    } catch (err) {
      setNoteError('Network error. Failed to add note.');
      console.error('Create note error:', err);
    } finally {
      setNoteLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const response = await fetch(`${API_URL}/notes/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      } else {
        if (response.status === 401) {
          handleSessionExpired();
        } else {
          alert('Failed to delete note.');
        }
      }
    } catch (err) {
      console.error('Delete note error:', err);
    }
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="logo-container">
          <FileText className="logo-icon" size={28} />
          <span>NoteVault</span>
        </div>
        
        {view === 'dashboard' && currentUser && (
          <div className="nav-user">
            <div className="user-badge">
              <User size={16} />
              <span>{currentUser.username}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </header>

      {/* Login Page */}
      {view === 'login' && (
        <main className="auth-wrapper">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Welcome Back</h1>
              <p>Sign in to access your secure notes vault</p>
            </div>

            {loginError && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{loginError}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-container">
                  <input
                    type="text"
                    id="username"
                    className="form-input"
                    placeholder="Enter your username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                  />
                  <User className="input-icon" size={18} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-container">
                  <input
                    type="password"
                    id="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <Lock className="input-icon" size={18} />
                </div>
              </div>

              <button className="btn-primary" type="submit" disabled={loginLoading}>
                {loginLoading ? (
                  <>
                    <Loader2 className="spinner" size={18} />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="auth-footer">
              Don't have an account? 
              <button className="auth-link" onClick={() => { setView('register'); setLoginError(''); }}>
                Sign Up
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Register Page */}
      {view === 'register' && (
        <main className="auth-wrapper">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Create Account</h1>
              <p>Register to start capturing your thoughts securely</p>
            </div>

            {registerError && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{registerError}</span>
              </div>
            )}

            {registerSuccess && (
              <div className="alert alert-success">
                <CheckCircle2 size={18} />
                <span>{registerSuccess}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="reg-username">Username</label>
                <div className="input-container">
                  <input
                    type="text"
                    id="reg-username"
                    className="form-input"
                    placeholder="Choose a username"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    required
                  />
                  <User className="input-icon" size={18} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">Email Address</label>
                <div className="input-container">
                  <input
                    type="email"
                    id="reg-email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                  <Mail className="input-icon" size={18} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <div className="input-container">
                  <input
                    type="password"
                    id="reg-password"
                    className="form-input"
                    placeholder="At least 6 characters"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                  <Lock className="input-icon" size={18} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password</label>
                <div className="input-container">
                  <input
                    type="password"
                    id="reg-confirm"
                    className="form-input"
                    placeholder="Re-enter password"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    required
                  />
                  <Lock className="input-icon" size={18} />
                </div>
              </div>

              <button className="btn-primary" type="submit" disabled={registerLoading}>
                {registerLoading ? (
                  <>
                    <Loader2 className="spinner" size={18} />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Sign Up</span>
                )}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account? 
              <button className="auth-link" onClick={() => { setView('login'); setRegisterError(''); }}>
                Sign In
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Dashboard View */}
      {view === 'dashboard' && (
        <main className="dashboard-wrapper">
          {/* Note Form Column */}
          <aside className="note-form-card">
            <h2>
              <PlusCircle size={20} className="logo-icon" />
              <span>New Note</span>
            </h2>

            {noteError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{noteError}</span>
              </div>
            )}

            {noteSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                <CheckCircle2 size={16} />
                <span>{noteSuccess}</span>
              </div>
            )}

            <form className="note-form" onSubmit={handleCreateNote}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Note Title"
                  className="note-input"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  maxLength={150}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  placeholder="Write your note content here..."
                  className="note-input"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                ></textarea>
              </div>
              <button className="btn-primary" type="submit" disabled={noteLoading}>
                {noteLoading ? 'Saving...' : 'Add Note'}
              </button>
            </form>
          </aside>

          {/* Notes List Column */}
          <section className="notes-container">
            <div className="notes-header">
              <h2>My Notes ({filteredNotes.length})</h2>
              
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="search-icon" size={16} />
              </div>
            </div>

            {notesLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--accent-primary)' }}>
                <Loader2 className="spinner" size={32} />
              </div>
            ) : filteredNotes.length > 0 ? (
              <div className="notes-grid">
                {filteredNotes.map((note) => (
                  <article className="note-card" key={note.id}>
                    <div className="note-card-header">
                      <h3 className="note-title">{note.title}</h3>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteNote(note.id)}
                        title="Delete note"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="note-content">{note.content}</p>
                    <div className="note-footer">
                      <span className="note-date">
                        <Calendar size={12} />
                        {new Date(note.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FileText className="empty-icon" size={48} />
                <h3>No notes found</h3>
                <p>
                  {searchQuery 
                    ? "No notes match your search criteria. Try a different query." 
                    : "Create your very first note using the form on the left!"}
                </p>
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
