import React, { useState } from "react";
import "./login.css";
import axios from "axios";
//import jwtDecode from "jwt-decode";
const Login = () => {
    const [login,setLogin] = useState('')
    const [password,setPassword]= useState('')
  function handleSocialLogin(e) {
    e.preventDefault();
    
     let body = JSON.stringify({ username:login, password:password })
    axios.post('http://localhost:5000/auth/login',{
      username:login,
      password:password
    }).then(response =>localStorage.setItem("twittertoken", response.data.token)).catch(err => alert(err)) 
    setTimeout(()=>{
      window.location.reload();

    },3000)

  }

  function handleInputChange(event) {
    setLogin(event.target.value);
}
function handleInputChanges(event) {
  setPassword(event.target.value);
}
  return (
    <div className="" style={{width:"90%",marginLeft:"5%"}}>
      <div className=""> 
        <img
          src="https://pluspng.com/img-png/png-twitter-logo-twitter-in-png-2500.png"
          alt="twitter logo"
          style={{ width: "32px", height: "32px" }}
        />
        <h4>Log in to Twitter</h4>
      </div>
      <div className="">
        <form id="form" className="form" onSubmit={e => handleSocialLogin(e)}>
          <div className="FormControl">
            <label htmlFor="email">Username</label>
            <input name="email" id="email" className="Input" onChange={handleInputChange} />
          </div>
          <div className="FormControl">
            <label htmlFor="password">Password</label>
            <input name="password" id="password" className="Input" onChange={handleInputChanges} />
          </div>
          <button className="FormButton">Log in</button>
        </form>
        <div>

          <span style={{ padding: "0 5px", color: "grey" }}>.</span>
        
        </div>
      </div>
    </div>
  );
};
export default Login;