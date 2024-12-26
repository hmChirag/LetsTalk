import React, { useEffect, useRef, useState } from 'react'
// import "../App.css"
import "../styles/VideoComponents.css";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';



const server_url="http://localhost:8000";

var connections={};

const peerConfigConnections={
    "iceServers":[
        {"urls": "stun:stun.l.google.com:19302"}
    ]
}


export default function VideoMeetComponent() {
    var socketRef=useRef();
    let socketIdRef=useRef();

    let localVideoRef=useRef();

    let [videoAvailable,setVideoAvailable]=useState(true);

    let [audioAvaialable,setAudioAvailable]=useState(true);
    
    let [audio,setAudio]=useState();
    let [video,setVideo]=useState();
    
    let [screen ,setScreen]=useState();
    
    let [showModel ,setModel]=useState();

    let [screenAvaialable,setScreenAvailable]=useState();

    let [message,setMessage]=useState("");
    let [messages,setMessages]=useState([]);

    let[newMessage,setNewMessage]=useState(0);

    let[username,setUserName]=useState("");
    let[askForUserName,setAskForUserName]=useState(true);

    const videoRef=useRef([]);

    let [videos,setVideos]=useState([]);


    const getPermissions=async()=>{
      try{
        const videoPermission= await navigator.mediaDevices.getUserMedia({video:false});

        if(videoPermission){
          setVideoAvailable(true);
        }else{
          setVideoAvailable(false);
        }

        const audioPermission= await navigator.mediaDevices.getUserMedia({audio:false});

        if(audioPermission){
          setAudioAvailable(true);
        }else{
          setAudioAvailable(false);
        }


        if(navigator.mediaDevices.getDisplayMedia){
          setScreenAvailable(true);
        }else{
          setScreenAvailable(false);
        }
        
      }catch{

      }
    }

    useEffect(()=>{
        getPermissions();
    },[])

  return (
    <div>
      {askForUserName === true ?
            <div>
              <h2>enter into the lobby</h2>
              <TextField id="outlined-basic" label="UserName" value={username} onChange={e=> setUserName(e.target.value)} variant="outlined" />
              <Button variant="contained">Contained</Button>
            


            <div>
              <video ref={localVideoRef} autoPlay muted></video>
            </div>
            </div>:<></>  
    }
    </div>
  )
}
