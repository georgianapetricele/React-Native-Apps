import { useState, useEffect } from "react";
import { Alert } from "react-native";

const WebSocketClient = (onMessageReceived) => {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newWs = new WebSocket("ws://172.30.245.172:2506");
    //const newWs = new WebSocket("ws://172.20.10.13:2505");
    //const newWs = new WebSocket("ws://10.0.2.2:2505");
    newWs.onopen = () => {
      setIsConnected(true);
      console.debug("WebSocket connected");
      //Alert.alert("Websocket connected. Server online");
    };

    newWs.onmessage = (e) => {
      if (onMessageReceived) {
        onMessageReceived(e.data);
      }
    };

    newWs.onclose = () => {
      setIsConnected(false);
      //Alert.alert("WebSocket disconnected. Server Offline");
    };

    newWs.onerror = (error) => {
      console.debug("WebSocket disconnected");
      Alert.alert("WebSocket disconnected. Server Offline");
    };

    setWs(newWs);

    return () => {
      if (newWs) {
        newWs.close();
      }
    };
  }, []);

  return { isConnected };
};

export default WebSocketClient;
