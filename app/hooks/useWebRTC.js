import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SIGNALING_SERVER_URL = 'http://localhost:8080';
const PC_CONFIG = {};

function useWebRTC() {
  
  const [remoteSteam, setRemoteStream] = useState();
  const socket = io(SIGNALING_SERVER_URL, { autoConnect: true });
  
  socket.on('data', (data) => {
    console.log('Data received: ',data);
    handleSignalingData(data);
  });

  socket.on('connect', () => {
    console.log('connected');
  })
  
  const makeCall = () => {
    console.log('calling');
    // Connection with signaling server is ready, and so is local stream
    createPeerConnection();
    sendOffer();
  };
  
  let sendData = (data) => {
    socket.emit('data', data);
  };
  
  // WebRTC methods
  let pc;
  let localStream;
  
  let getLocalStream = () => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then((stream) => {
        console.log('Stream found');
        localStream = stream;
        // Connect after making sure that local stream is availble
        socket.connect();
      })
      .catch(error => {
        console.error('Stream not found: ', error);
      });
  }
  
  let createPeerConnection = () => {
    try {
      pc = new RTCPeerConnection(PC_CONFIG);
      pc.onicecandidate = onIceCandidate;
      pc.onaddstream = onAddStream;
      pc.addStream(localStream);
      console.log('PeerConnection created');
    } catch (error) {
      console.error('PeerConnection failed: ', error);
    }
  };
  
  let sendOffer = () => {
    console.log('Send offer');
    pc.createOffer().then(
      setAndSendLocalDescription,
      (error) => { console.error('Send offer failed: ', error); }
    );
  };
  
  let sendAnswer = () => {
    console.log('Send answer');
    pc.createAnswer().then(
      setAndSendLocalDescription,
      (error) => { console.error('Send answer failed: ', error); }
    );
  };
  
  let setAndSendLocalDescription = (sessionDescription) => {
    pc.setLocalDescription(sessionDescription);
    console.log('Local description set');
    sendData(sessionDescription);
  };
  
  let onIceCandidate = (event) => {
    if (event.candidate) {
      console.log('ICE candidate');
      sendData({
        type: 'candidate',
        candidate: event.candidate
      });
    }
  };
  
  let onAddStream = (event) => {
    console.log('Add stream');
    setRemoteStream(event.stream);
  };
  
  let handleSignalingData = (data) => {
    switch (data.type) {
      case 'offer':
        createPeerConnection();
        pc.setRemoteDescription(new RTCSessionDescription(data));
        sendAnswer();
        break;
      case 'answer':
        pc.setRemoteDescription(new RTCSessionDescription(data));
        break;
      case 'candidate':
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        break;
    }
  };
  

  return {
    getLocalStream,
    remoteSteam,
    makeCall
  }

}

export default useWebRTC;

