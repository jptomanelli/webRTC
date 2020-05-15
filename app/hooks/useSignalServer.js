import { useState, useEffect } from 'react';
import useSockets from './useSockets';

const configuration = {};

function useSignalServer({ stream: localStream }) {

  let pc;

  const { socket, socketStatus } = useSockets();
  const [ready, setReady] = useState(false);
  const [peers, setPeers] = useState({});
  const [remoteStream, setRemoteStream] = useState(null);

  const sendData = (id, data) => {
    if (!ready) {
      throw Error("Cannot send data with invalid socket");
    }
    socket.emit('data', { id, data });
  };

  const createPeerConnection = () => {
    pc = new RTCPeerConnection(configuration);
    pc.onIceCandidate = e => {
      if (e.candidate) {
        console.log('ICE candidate');
        sendData({
          type: 'candidate',
          candidate: e.candidate
        });
      }
    };
    pc.onAddStream = e => {
      console.log('Add stream');
      setRemoteStream(e.stream);
    };
    pc.addStream(localStream);
    console.log('PeerConnection created');
  };

  useEffect(() => {
    if (socket && socketStatus === 'connected') {
      setReady(true);
      socket.on('data', (data) => {
        console.log('Data received: ', data);
        // handleSignalingData(data);
      });

      socket.on('ready', () => {
        console.log('Ready');
        // Connection with signaling server is ready, and so is local stream
        // createPeerConnection();
        // sendOffer();
      });


    }
  }, [socket, socketStatus]);

  return {
    ready,
    sendData
  };
}

export default useSignalServer;