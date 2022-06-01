import './App.css';
import Sidebar from './Sidebar';
import Feed from './Feed'
import Widgets from './Widgets'
import { Routes,Route,BrowserRouter } from 'react-router-dom';
import Explore from './explore';
import Profile from './profile';
import Message from './message';
import Login from './login';
import { useEffect } from 'react';
import axios from 'axios';
//import Sidebar from './sidebar/Sidebar';
function App() {

  return (
    <div className="app">
   <Sidebar />
      {/* Feed */}
      <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Feed />} />
   
        <Route exact path="/profile" element={<Profile />} />
        <Route exact path="/explore" element={<Explore />} />
        <Route exact path="/message" element={<Message />} />
        <Route exact path="/login" element={<Login />} />
      </Routes>
      </BrowserRouter>
      {/* Widget */}
        <Widgets />
    </div>
  );
}

export default App;
