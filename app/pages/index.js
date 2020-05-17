import { useEffect, useState, useRef } from 'react';
import Video from '../components/Video';
import { Button, Container, CircularProgress, Fade } from '@material-ui/core';
import io from 'socket.io-client';
import crypto from 'crypto';

import useDevices from '../hooks/useDevices';
import useSockets from '../hooks/useSockets';
import useFunctionAsState from '../hooks/useFunctionAsState';

function IndexPage({ socketServerUrl, config }) {

  const { stream, startStream, endStream, streamStatus } = useDevices();
  const { socket, socketStatus, sendData } = useSockets({ socketServerUrl });

  const [pc, setPc] = useState(null);
  const [remoteStream, setRemoteStream] = useState();

  const [sendOffer, setSendOffer] = useFunctionAsState(() => { });

  useEffect(() => {
    if (streamStatus === 'connected' && socketStatus === 'connected') {
      import('webrtc-adapter').then(() => {
        console.log(config);
        const pc = new RTCPeerConnection(config);
        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            console.log('ICE candidate');
            sendData({
              type: 'candidate',
              candidate
            });
          }
        };
        pc.onaddstream = ({ stream }) => {
          console.log("STREAM ADDED");
          setRemoteStream(stream);
        }
        pc.addStream(stream);
        setPc(pc);
      });
    }
  }, [socket, socketStatus, stream, streamStatus, sendData]);

  useEffect(() => {
    if (pc) {

      const setAndSendLocalDescription = (sessionDescription) => {
        pc.setLocalDescription(sessionDescription);
        console.log('Local description set');
        sendData(sessionDescription);
      };

      const sendAnswer = () => {
        console.log('Send answer');
        pc.createAnswer().then(
          setAndSendLocalDescription,
          (error) => { console.error('Send answer failed: ', error); }
        );
      };

      socket.on('data', (data) => {
        switch (data.type) {
          case 'offer':
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
      });

      setSendOffer(() => {
        console.log('Send offer');
        pc.createOffer().then(
          setAndSendLocalDescription,
          (error) => { console.error('Send offer failed: ', error); }
        );
      });

    }
  }, [pc, sendData]);

  return (
    <Container maxWidth="md">
      <h1>Welcome</h1>
      <Fade
        in={false}
        style={{
          transitionDelay: true ? '0ms' : '800ms',
        }}
        unmountOnExit
      >
        <CircularProgress />
      </Fade>
      {remoteStream ? (
        <><p>Remote</p><Video stream={remoteStream} /></>
      ) : (
          <>
            <p>local</p><Video stream={stream} />
          </>
        )}

      <Button
        variant="contained"
        color="primary"
        disabled={false}
        onClick={streamStatus === 'disconnected' ? startStream : endStream}
      >
        {streamStatus === 'disconnected' ? 'Start Cam' : 'End Cam'}

      </Button>
      <Button
        variant="contained"
        color="default"
        onClick={sendOffer}
      >
        Make Call
      </Button>
    </Container>
  );
}

export async function getServerSideProps() {

  const server = `turn:${process.env.TURN_SERVER_URL}`;
  const secret = process.env.TURN_SECRET;
  const ttl = process.env.TURN_TTL;

  const unixTimeStamp = +(Date.now() / 1000) + 24 * 3600;
  const username = unixTimeStamp + ttl;
  const hmac = crypto.createHmac('sha1', secret);

  hmac.setEncoding('base64');
  hmac.write(username);
  hmac.end();

  const credential = hmac.read();

  const config = {
    iceServers: [{
      urls: `${server}?transport=tcp`,
      username,
      credential
    }, {
      urls: `${server}?transport=udp`,
      username,
      credential
    }]
  };

  return {
    props: {
      config,
      socketServerUrl: process.env.SOCKET_SERVER_URL
    }
  };
}

export default IndexPage;