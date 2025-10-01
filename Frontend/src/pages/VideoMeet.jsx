import React, { useEffect, useRef, useState } from 'react'
import io, { Socket } from "socket.io-client";
import "../styles/VideoComponents.css";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Badge, IconButton } from '@mui/material';
import VideocamIcon from "@mui/icons-material/Videocam"
import VideocamOffIcon from "@mui/icons-material/VideocamOff"
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from "@mui/icons-material/Mic"
import MicOffIcon from "@mui/icons-material/MicOff"
import ScreenShareIcon from "@mui/icons-material/ScreenShare"
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare"
import ChatIcon from "@mui/icons-material/Chat"
import server from '../environment';

const server_url=server; // use this for production

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
    let [video,setVideo]=useState([]);
    
    let [videos,setVideos]=useState([]);
    let [screen ,setScreen]=useState();
    
    let [showModel ,setModel]=useState(true);

    let [screenAvailable,setScreenAvailable]=useState();

    let [message,setMessage]=useState("");
    let [messages,setMessages]=useState([]);

    let[newMessage,setNewMessage]=useState(0);

    let[username,setUserName]=useState("");
    let[askForUserName,setAskForUserName]=useState(true);

    const videoRef=useRef([]);




    /*
    the whole funda here which is happenening in the below code is as follow
    
    step 1: an offer is created by the user
    step 2: the offer is sent to the server
    step 3: the server sends the offer to all the other users
    step 4: each user creates an answer and sends it to the server
    step 5: the server sends the answer to the user who created the offer
    step 6: the user who created the offer sets the answer as the remote description
    step 7: the user who created the offer sets the local description as the offer
    step 8: the user who created the offer sets the peer connection as the peer connection
    
    In the end the connection is established and the user can see the video of the other user
    */






    const getPermissions=async()=>{
      try{

        const videoPermission= await navigator.mediaDevices.getUserMedia({video:true});

        if(videoPermission){
          setVideoAvailable(true);
        }else{
          setVideoAvailable(false);
        }

        const audioPermission= await navigator.mediaDevices.getUserMedia({audio:true});

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


        if(videoAvailable || audioAvaialable){
          const userMediaStream =await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvaialable})

          if(userMediaStream){
            window.localStream=userMediaStream;
            if(localVideoRef.current){
              localVideoRef.current.srcObject=userMediaStream;
            }
          }
        }
        
      }catch(err){
        console.log(err);
      }
    }



    useEffect(()=>{
        getPermissions();
    },[])



    let getUserMediaSuccess=(stream)=>{
      
      try{
        window.localStream.getTracks().forEach(tracks=>{tracks.stop()})    
      }catch(e){console.log(e)}

      window.localStream=stream;
      localVideoRef.current.srcObject=stream;
      
      for(let id in connections){
        if(id===socketIdRef.current) continue

        connections[id].addStream(window.localStream)

        connections[id].createOffer().then((description)=>{
          connections[id].setLocalDescription(description)
          .then(()=>{
            socketIdRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}))
          })
          .catch(e=>console.log(e))
        })
      }

      stream.getTracks().forEach(track => track.onended=()=>{
        setAudio(false);
        setVideo(false);

        try{
            let tracks =localVideoRef.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        }catch(e){console.log(e)}


        let blackSilence = (...args)=> new MediaStream([black(...args),silence()]);
        window.localStream =blackSilence();
        localVideoRef.current.srcObject= window.localStream;

        for(let id in connections){
          connections[id].addStream(window.localStream)
          connections[id].createOffer().then((description)=>{
            connections[id].setLocalDescription(description)
            .then(()=>{
              socketIdRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription}))
            })
            .catch(e=>console.log(e))
          })
        }
      })
    }


    
    /*
         here basically we are creating a constat silent sound which will be oscillated 
         continuoeslly when the audio is muted by user 
         so as to maintain a continous silent audio
      */
    let silence=()=>{
      let ctx=new AudioContext()
      let oscillator=ctx.createOscillator();
      let dst= oscillator.connect(ctx.createMediaStreamDestination());
      oscillator.start();
      ctx.resume()

      return Object.assign(dst.stream.getAudioTracks()[0],{enabled:false})
    }

    /*
    similar way we create a blank screen which will be 
    displayed when the video is muted by user
    */
    let black =({width=640,height=480}={})=>{
      let canvas = Object.assign(document.createElement("canvas",{width,height}));

      canvas.getContext('2d').fillRect(0,0,width,height);
      let stream=canvas.captureStream();
      return Object.assign(stream.getVideoTracks()[0],{enabled:false});
    }


    let getUserMedia=()=>{
      if((video && videoAvailable) || (audio && audioAvaialable)){
        navigator.mediaDevices.getUserMedia({video: video, audio: audio})
        .then((stream) => {
          window.localStream = stream;
          localVideoRef.current.srcObject = stream;
        })
        .catch((e) => console.log(e));
    }else{
      try{
        let tracks=localVideoRef.current.srcObject.getTracks();
        tracks.forEach(tracks=>tracks.stop());
      }catch(e){

      }
    }
  }



    useEffect(()=>{
      if(video !== undefined && audio !== undefined){
          getUserMedia();
      }
    },[audio,video])


    let pendingICECandidates = {};

    let gotMessageFromServer = (fromId, message) => {
      const signal = JSON.parse(message);
    
      if (fromId !== socketIdRef.current) {
        if (signal.sdp) {
          connections[fromId]
            .setRemoteDescription(new RTCSessionDescription(signal.sdp))
            .then(() => {
              // Process any queued ICE candidates for this connection
              if (pendingICECandidates[fromId]) {
                pendingICECandidates[fromId].forEach((candidate) => {
                  connections[fromId]
                    .addIceCandidate(new RTCIceCandidate(candidate))
                    .catch((e) => console.error("Error adding ICE candidate:", e));
                });
                delete pendingICECandidates[fromId]; // Clear the queue
              }
    
              if (signal.sdp.type === 'offer') {
                connections[fromId]
                  .createAnswer()
                  .then((description) => {
                    connections[fromId]
                      .setLocalDescription(description)
                      .then(() => {
                        socketRef.current.emit(
                          "signal",
                          fromId,
                          JSON.stringify({ sdp: connections[fromId].localDescription })
                        );
                      })
                      .catch((e) => console.log(e));
                  })
                  .catch((e) => console.log(e));
              }
            })
            .catch((e) => console.error("Error setting remote description:", e));
        }
    
        if (signal.ice) {
          if (connections[fromId].remoteDescription) {
            connections[fromId]
              .addIceCandidate(new RTCIceCandidate(signal.ice))
              .catch((e) => console.error("Error adding ICE candidate:", e));
          } else {
            // Queue the ICE candidate if the remote description is not set
            if (!pendingICECandidates[fromId]) {
              pendingICECandidates[fromId] = [];
            }
            pendingICECandidates[fromId].push(signal.ice);
          }
        }
      }
    };
    

    const addMessage = (data, sender, socketIdSender) => {
      setMessages((prevMessages) => [
          ...prevMessages,
          { sender: sender, data: data }
      ]);
      if (socketIdSender !== socketIdRef.current) {
        setNewMessage((prevNewMessages) => prevNewMessages + 1);
      }
  };

    
    let connectToSocketServer=()=>{
      socketRef.current=io.connect(server_url,{secure:false})

      socketRef.current.on('signal',gotMessageFromServer)
      
      socketRef.current.on('connect',()=>{
        socketRef.current.emit("join-call",window.location.href)
        socketIdRef.current=socketRef.current.id

        socketRef.current.on("chat-message",addMessage)
        
        socketRef.current.on("user-left",(id)=>{
          setVideos((videos)=>videos.filter((video)=>video.socketId !== id))
        })
        
        socketRef.current.on("user-joined",(id,clients)=>{
          clients.forEach((socketListId)=>{
            //RTCPeerConnection is used to establish one to one connection between two people
            connections[socketListId]=new RTCPeerConnection(peerConfigConnections)

            connections[socketListId].onicecandidate=(event)=>{
              if(event.candidate !== null ){
                socketRef.current.emit("signal",socketListId,JSON.stringify({'ice':event.candidate}))
              }
            }

            // Wait for their video stream
            connections[socketListId].onaddstream = (event) => {

              let videoExists = videoRef.current.find(video => video.socketId === socketListId);

              if (videoExists) {
                  console.log("FOUND EXISTING");

                  // Update the stream of the existing video
                  setVideos(videos => {
                      const updatedVideos = videos.map(video =>
                          video.socketId === socketListId ? { ...video, stream: event.stream } : video
                      );
                      videoRef.current = updatedVideos;
                      return updatedVideos;
                  });
              } else {
                  // Create a new video
                  console.log("CREATING NEW");
                  let newVideo = {
                      socketId: socketListId,
                      stream: event.stream,
                      autoplay: true,
                      playsinline: true
                  };

                  setVideos(videos => {
                      const updatedVideos = [...videos, newVideo];
                      videoRef.current = updatedVideos;
                      return updatedVideos;
                  });
              }
          };
            



            if(window.localStream !== undefined && window.localStream !== null){
              connections[socketListId].addStream(window.localStream);
            }else{
              let blackSilence = (...args)=> new MediaStream([black(...args),silence()]);
              window.localStream =blackSilence();
              connections[socketListId].addStream(window.localStream);
            }
        })



          /**?  note about diff bw try catch and then catch
           * Use try-catch with async/await when working in modern async/await-based code for better readability.
             
             Use .then-catch when handling Promises directly, especially in modular or functional programming styles.
           */


          if(id=== socketIdRef.current){
            for(let id2 in connections){
              if(id2 ===socketIdRef.current) continue

              try{
                connections[id2].addStream(window.localStream)
              }catch(e){}

              connections[id2].createOffer().then((description)=>{
                connections[id2].setLocalDescription(description)
                .then(()=>{                                    //sdp stands for session description
                  socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }));
                })                                    //here the setLocalDescription use very crucial for establishing the handshake between the two peers which finally leads to the connection establishment 
                .catch(e=>console.log(e));
              })
            }
          }
        })
      
      })
    }

 
    
    
    let getMedia=(()=>{
      setVideo(videoAvailable);
      setAudio(audioAvaialable);
      
      connectToSocketServer();
    })
    
    
    
    let connect=()=>{
      setAskForUserName(false);
      getMedia();
    }
    
    
    let handleVideo=()=>{
      setVideo(!video);
    }
    
    
    let handleAudio=()=>{
      setAudio(!audio);
    }


    let getDisplayMediaSuccess=(stream)=>{
      try{
        window.localStream.getTracks().forEach(track => track.stop())
      }catch(e){
        console.log(e);
      }

      window.localStream = stream;
      localVideoRef.current.srcObject = stream;
    
      for(let id in connections){
        if(id === socketIdRef.current) continue ;

        connections[id].addStream(window.localStream)
        connections[id].createoOffer().then((description => [
          connections[id].setLocalDescription(description)
          .then(()=>{
            socketRef.current.emit("signal", id ,JSON.stringify({"sdp": connections[id].localDescription}))
          })
          .catch(e =>console.log(e))
        ]))
      }

      stream.getTracks().forEach(track => track.onended=()=>{
        setScreen(false)

        try{
            let tracks =localVideoRef.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        }catch(e){console.log(e)}


        let blackSilence = (...args)=> new MediaStream([black(...args),silence()]);
        window.localStream =blackSilence();
        localVideoRef.current.srcObject= window.localStream;

        getUserMedia();
      })
    
    }

    let getDisplayMedia=()=>{
      if(screen){
        if(navigator.mediaDevices.getDisplayMedia){
          navigator.mediaDevices.getDisplayMedia({video: true, audio:true})
          .then(getDisplayMediaSuccess)
          .then((stream) =>{ })
          .catch((e)=>{console.log(e)})
        }
      }
    }

    useEffect(()=>{
      if(screen !== undefined){
        getDisplayMedia();
      }
    },[screen])

    let handleScreen=()=>{
      setScreen(!screen);
    }

    let handleEndCall = () => {
      try {
          let tracks = localVideoref.current.srcObject.getTracks()
          tracks.forEach(track => track.stop())
      } catch (e) { }
      window.location.href = "/home"
  }

    let sendMessage =()=>{
      socketRef.current.emit("chat-message", message ,username);
      setMessage("");
    }

  return (
    <div>
      {askForUserName === true ?
            <div>
              <h2 style={{textAlign:"center" , marginTop:"50px"}}>Enter the meeting using your user name below : </h2>
              <TextField style={{margin:"10px",marginLeft:"140px"}} id="outlined-basic" label="UserName" value={username} onChange={e=> setUserName(e.target.value)} variant="outlined" />
              {/* <TextField id="outlined-basicc" label="UserName" variant="outlined" /> */}
              
              <Button style={{margin: "20px"}} variant="contained" id="button-connect" onClick={connect}>Connect</Button>
            
              <div>
                <video ref={localVideoRef} autoPlay muted></video>
              </div>

            </div>:

            <div className='meetVideoContainer'> 


              {showModel ? 
               <div className="chatRoom">
                  <div className='chatContainer'>
                    <h2 style={{color:"black",textAlign:"center"}}>Chat section</h2>
                    
                    <div className="chattingDisplay">
                      {messages.length !== 0 ? messages.map((item, index) => {
                      // console.log(messages)
                      return (
                          <div style={{ marginBottom: "20px" }} key={index}>
                              <p style={{ fontWeight: "bold",color:"black" }}>{item.sender}</p>
                              <p style={{color:"black"}}>{item.data}</p>
                          </div>
                      )
                      }) : <p>No Messages Yet</p>}
                    </div>




                    <div className="chatArea">
                      <TextField value={message} onChange={ (e) => setMessage(e.target.value)} id="outlined-basicc" label="Enter your message" variant="outlined" />
                      <Button style={{margin:"10px"}} variant='contained' onClick={sendMessage}>Send</Button>
                    </div>
                  </div>
                </div> : <></>}
              

              <div className='buttonContainers'>

                <IconButton onClick={handleVideo}>
                  {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                </IconButton>
                <IconButton onClick={handleEndCall} style={{color:"red"}}>
                  <CallEndIcon/>
                </IconButton>
                <IconButton onClick={handleAudio}>
                  {(audio === true) ? <MicIcon /> : <MicOffIcon />}
                </IconButton>

                {screenAvailable === true ?
                  <IconButton onClick={handleScreen}>
                    {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                  </IconButton> : <></>}
              

                <Badge badgeContent={newMessage} max={999} color='secondary'>
                  <IconButton onClick={()=>setModel(!showModel)} style={{color:"white"}}>
                    <ChatIcon/>
                  </IconButton>
                </Badge>
              </div>  
 
              <video className='meetUserVideo' ref={localVideoRef} autoPlay muted></video>


              <div className='conferenceView'>  
                {videos.length !== 0 ? (
                  videos.map((video) => (
                    <div className="conferenceView" key={video.socketId}>
                      {/* <h2>{video.socketId}</h2> */}
                      <video
                        data-socket={video.socketId}
                        ref={(ref) => {
                          if (ref && video.stream) {
                            ref.srcObject = video.stream;
                            ref.play().catch((err) => console.error("Video play failed:", err));
                          }
                        }}
                        autoPlay
                        muted
                        playsInline
                      ></video>
                    </div>
                  ))
                ) : (
                  <p>No Users Online</p>
                )}
              </div>  

            </div>
    }
    </div>
  )
}
