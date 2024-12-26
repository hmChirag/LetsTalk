import React from 'react'
import "../App.css"
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <>
      <div className='LandingPageContainer'>
        
        <nav>
          <div className='navHeader'>
            <h2>
              Apna video call
            </h2>
          </div>
          <div className='navlist'>
            <p>Join as guest</p>
            <p>Register</p>
            <button>Login</button>
          </div>
        </nav>

        <div className="LandingPageMainContainer">
          <div>
            <h1><span style={{color:"#FF9839"}}>Connect </span>with your loved ones</h1>
            <h2 style={{padding:"1rem"}}>Cover the distance by Apna Video Call</h2>
            <div role='button'>
              <Link to={"/auth"}>Get Started</Link>
            </div>
          </div>

          <div >
            <img src='/mobile.png' alt='image'></img>
          </div>
        </div>

      </div>

      
    </>
  )
}
