import React, { useState } from 'react'
import withAuth from '../utils/withAuth';
import "../styles/VideoComponents.css"
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';

function HomeComponent() {

  let navigate = useNavigate();
  const [meetingCode,setMeetingCode] = useState();
  let handleJoinVideoCall= async ()=>{
    navigate(`/${meetingCode}`)
  }


  return (
    <>
        <nav>
          <div className='navBar' style={{display:"flex", justifyContent:"space-between"}}>
            <h2 style={{margin:"15px", marginRight:"520px"}}>
              Apna video call
            </h2>
            <div style={{margin:"10px",marginRight:"30px"}}>
              <IconButton style={{marginRight:"20px"}}>
                <RestoreIcon></RestoreIcon>
                <p>History</p>
              </IconButton>

              <Button variant='contained'  onClick={()=>{
                localStorage.removeItem("token");
                navigate("/auth");
              }}>LogOut</Button>
            </div>
          </div>
        </nav>


        <div className='meetContainer' style={{display:"flex", alignItems:"center", margin:"30px",marginTop:"100px",padding:"20px",marginLeft:"30px"}}>
          
          <div className='leftPanel' style={{marginRight:"25px"}}>
            <div style={{display:" flex", flexDirection:"column", alignItems:"center"}}>
              <h2>Providing quality video call without any compromise</h2>
              <div style={{ display: 'flex', gap: "10px" }}>
                  <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" />
                  <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>
              </div>
            </div>
          </div>


          <div className='rightPanel' style={{display:"flex",alignItems:"center"}}>
              <img srcSet='/public/call.png' style={{width:"30vw",height:"auto",borderRadius:"20px"}}></img>
          </div>
        </div>

      
    </>
  )
}

export default withAuth(HomeComponent);