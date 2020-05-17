import { useEffect, useState } from 'react';
import io from 'socket.io-client';

import useFunctionAsState from './useFunctionAsState';

function useSockets({ socketServerUrl }) {

  const [status, setStatus] = useState("disconnected");
  const [socket, setSocket] = useState();
  const [sendData, setSendData] = useFunctionAsState(() => { });

  useEffect(() => {

    const s = io(socketServerUrl, {
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