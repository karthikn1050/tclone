import React from 'react'
import { useState } from 'react'
import "./Sidebar.css"
import TwitterIcon from '@material-ui/icons/Twitter'
import SidebarOption from './SidebarOption'
import HomeIcon from '@material-ui/icons/Home'
import SearchIcon from '@material-ui/icons/Search'
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone'
import MailOutlineIcon from '@material-ui/icons/MailOutlineOutlined'
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder'
import ListAltIcon from '@material-ui/icons/ListAlt'
import PermIdentityIcon from '@material-ui/icons/PermIdentity'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import { Button } from '@material-ui/core'
import "bootstrap-icons/font/bootstrap-icons.css";
import Login from './login'
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.min.css";
import './Sidebar.css'
const user = localStorage.getItem('twittertoken')

function Sidebar() {
  const [modalIsOpen, setModalIsOpen] = useState(false);

    const setModalIsOpenToTrue =()=>{
        setModalIsOpen(true)
    }
    const setModalIsOpenToFalse =()=>{
      setModalIsOpen(false)
  } 
  const logout =()=>{
      localStorage.removeItem('twittertoken')
      window.location.reload();
  }
    return (
        <div className = "sidebar">
          {/*  <TwitterIcon
              className = "sidebar__twitterIcon"                
           />  */}
            <h3>iDiscover</h3>
           <SidebarOption
              Icon={HomeIcon}
              text = "Home"  
              path ='/'
              active
              
           />
            <div className = {`sidebarOption `}> 
            <SearchIcon />
            <a style={{textDecoration:"none"}} href='/explore'> <h2>Explore</h2>
          </a>
        </div>
        
          {user &&
          <div>
           <SidebarOption 
              Icon = {MailOutlineIcon}
              text = "Message" 
              path='/message' 
           />
          
          
           <SidebarOption 
              Icon = {PermIdentityIcon}
              text = "Profile" 
               path ='/profile'
           />
           </div>
          }
        { !user  && <Button variant = "outlined" onClick={setModalIsOpenToTrue} className = "sidebar__tweet">Login</Button>  }
        {user &&  <Button variant = "outlined"  onClick={logout} className = "sidebar__tweets">Logout</Button>}
        <Modal show={modalIsOpen} onHide={modalIsOpen}>
    
      <Modal.Body>
         <Login />
      </Modal.Body>
     
      <Button onClick={setModalIsOpenToFalse}>Close</Button>
    </Modal>
        </div>
    )
}

export default Sidebar
