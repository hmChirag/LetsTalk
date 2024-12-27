import React, { useEffect, useRef, useState } from 'react'
import io, { Socket } from "socket.io-client";
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
    let [video,setVideo]=useState([]);
    
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
      if((video && videoAvailable) || (audio && audioAvailable)){
        navigator.mediaDevices.getUserMedia({video: video, audio: audio})
        // .then(()=>{})
        // .then((stream)={})
        // .catch((e)=>console.log(e))
        .then((stream) => {
          // Handle the stream here
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





    let gotMessageFromServer=(fromId,message)=>{
      var signal=JSON.parse(message);

      if(fromId !== socketIdRef.current){
        
        if(signal.sdp){
          connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(()=>{
            
            if(signal.sdp.type === 'offer'){
              connections[fromId].createAnswer().then((description)=>{
                connections[fromId].setLocalDescription(description).then(()=>{

                  //sending the signal that the signal is recieved and nowwe can talk to our stun server
                  socketIdRef.current.emit("signal",fromId,JSON.stringify({"sdp":connections[fromId].localDescription}))
                }).catch(e=>console.log(e));
              }).catch(e=>console.log(e))
            }
          }).catch(e=>console.log(e))
        }

        if(signal.ice){
          connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).then(()=>{}).catch(e=>console.log(e))
        }
      }
    }





    let connectToSocketServer=()=>{
      socketRef.current=io.connect(server_url,{secure:false})

      socketRef.current.on('signal',gotMessageFromServer)
      
      socketRef.current.on('connect',()=>{
        socketRef.current.emit("join-call",window.location.href)
        socketIdRef.current=socketRef.current.id

        socketRef.current.on("chat-message",addmessage)
        
        socketRef.current.on("user-left",(id)=>{
          setVideo((videos)=>videos.filter((video)=>video.socketId !== id))
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

            connections[socketListId].onaddstream=(event)=>{
               
              let videoExists= videoRef.current.find(video=> video.socketId === socketListId);
              if(videoExists){
                setVideo(videos=>{
                  const updatedVideos =videos.map(videos=>
                    video.socketId === socketListId ? {...video,stream: event.stream} : video
                  );
                  videoRef.current =updatedVideos;
                  return updatedVideos;
                })
              }else{

                let newVideo = {
                  socketId: socketListId,
                  stream:event.stream,
                  autoPlay:true,
                  playinline:true
                }

                setVideos(videos=>{ //here (...) the spread operator is used in otder to spread the elements from the array 
                  const updatedVideos=[...videos,newVideo];
                  videoRef.current =updatedVideos;
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
                  socketRef.current.emit("signal",id2,JSON.stringify({"sdp":connections[id2].setLocalDescription}))
                })                                       //here the setLocalDescription use very crucial for establishing the handshake between the two peers which finally leads to the connection establishment 
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



  return (
    <div>
      {askForUserName === true ?
            <div>
              <h2>enter into the lobby</h2>
              <TextField id="outlined-basic" label="UserName" value={username} onChange={e=> setUserName(e.target.value)} variant="outlined" />
              {/* <TextField id="filled-basic" label="Filled" variant="filled" /> */}
              
        
              <Button variant="contained" id="button-connect" onClick={connect}>Connect</Button>
            


            <div>
              <video ref={localVideoRef} autoPlay muted></video>
            </div>
            </div>:<> 
              <video ref={localVideoRef} autoPlay muted></video>

              {videos.map((video)=>{
                <div key={video.socketId}>

                </div>
              })}
            </>  
    }
    </div>
  )
}
