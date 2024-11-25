import * as StompJS from "@stomp/stompjs";
const { VITE_DEV_SERVER_SOCKET_END_POINT, VITE_SERVER_SOCKET_END_POINT } = import.meta.env;

export const SERVER_END_POINT = import.meta.env.DEV ? VITE_DEV_SERVER_SOCKET_END_POINT : VITE_SERVER_SOCKET_END_POINT;
// const { VITE_SOCKET_SERVER_END_POINT, VITE_DEV_SOCKET_SERVER_END_POINT } = import.meta.env;

const SOCKET_END_POINT = `${SERVER_END_POINT}`;

function createSocket() {
  let stomp = null;

  const connect = (onConnect) => {
    if (stomp) {
      stomp.deactivate();
    }

    stomp = new StompJS.Client({
      brokerURL: SOCKET_END_POINT,
      onConnect,
      connectHeaders: {},
      reconnectDelay: 100,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onChangeState: state => console.log(`state`, state),
      onStompError: (frame) => {
        console.error("STOMP 오류:", frame.headers["message"]);
      },
      // debug: (msg) => console.log("DEBUG: ", msg), // 디버깅 로그 활성화
    });

    stomp.activate();
  };

  const send = (destination, obj, body) => {
    if (!stomp) {
      return;
    }

    stomp.publish({
      destination,
      body,
    });
  };

  const subscribe = (destination, cb) => {
    if (!stomp) {
      return;
    }

    stomp.subscribe(destination, cb);
  };

  const disconnect = () => {
    if (!stomp) {
      return;
    }

    stomp.deactivate();
  };

  return {
    stomp,
    connect,
    send,
    subscribe,
    disconnect,
  };
}

export const socket = createSocket();
