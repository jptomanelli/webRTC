import { useEffect, useState } from 'react';
import io from 'socket.io-client';

import useFunctionAsState from './useFunctionAsState';

function useSockets() {

  const [status, setStatus] = useState("disconnected");
  const [socket, setSocket] = useState();
  const [sendData, setSendData] = useFunctionAsState(() => {});

  useEffect(() => {

    const s = io(`${location.protocol}//${location.hostname}:8080`, {
      path: '/socket'
    });

    setSocket(s);
    
    s.on('connect', () => setStatus("connected"));
    s.on('disconnect', () => setStatus('disconnected'));

    setSendData(data => s.emit('data', data));

    return () => {
      s.disconnect();
    }

  }, []);

  return {
    socket,
    socketStatus: status,
    sendData
  };
  
}

export default useSockets;