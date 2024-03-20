import { error } from "console";
import { WebSocket, Event, CloseEvent, MessageEvent } from "ws";
import sleep from "../sleep";

interface topicArray {
    [index: string]: (data: any)=>void;
}

export default class KucoinWebSocket{
    
    private static BASE_URL = 'https://api-futures.kucoin.com';

    private id: string | null = null;
    private token: string;
    private endpoint: string;
    private pingInterval: number;
    private socket: WebSocket;

    private topic: topicArray = {};

    private constructor(token: string, endpoint: string, pingInterval: number){
        this.token = token;
        this.endpoint = endpoint;
        this.pingInterval = pingInterval;
        
        this.socket = new WebSocket(
            `${this.endpoint}?token=${token}`,
        );

        this.socket.onopen =    (event: Event) => this.onOpen(event);
        this.socket.onclose =   (event: CloseEvent) => this.onClose(event);
        this.socket.onmessage = (event: MessageEvent) => this.onMessage(event);
        this.socket.onerror =   (event: Event) => this.onError(event);
    }

    public static async createWebSocket(){
        const res = await (await fetch(`${this.BASE_URL}/api/v1/bullet-public`, {method: 'POST'})).json();
        if(res.code !== '200000')throw error(`createWebSocket res.code === ${res.code}`);

        const token = res.data.token;
        const endpoint = res.data.instanceServers[0].endpoint;
        const pingInterval = res.data.instanceServers[0].pingInterval;
        console.log(endpoint);
        return new KucoinWebSocket(token, endpoint, pingInterval);
    }

    private onOpen(event: Event) {
      console.log('WebSocket connection opened');
    }

    private onClose(event: CloseEvent) {
      console.log('WebSocket connection closed');
      console.log('WebSocket connection closed');
      console.log(JSON.stringify(event.code));
      console.log(JSON.stringify(event.reason));
      console.log(JSON.stringify(event.target));
      console.log(JSON.stringify(event.type));
      console.log(JSON.stringify(event.wasClean));
    }

    private onMessage(event: MessageEvent) {
        const data = JSON.parse(event.data.toString());
  
        switch (data.type) {
            case 'welcome':
              this.handleWelcomeMessage(data);
              break;
            case 'message':
                this.topic[data.topic](data.data);
                break;
            case 'pong':
              this.handlePongMessage(data);
              break;
            case 'ack':
              this.handleAckMessage(data);
              break;
            default:
              //console.log(data);
              break;
          }
        
    }

    private onError(event: Event) {
      console.error('WebSocket error:', event);
      console.log(event);
    }

    private handleWelcomeMessage(message: any) {
      console.log('Received welcome message:', message);
      this.id = message.id;
      setInterval(()=>this.ping(), this.pingInterval/2);
    }

    private handlePongMessage(message: any) {
      console.log('Received pong message:', message);
    }

    private handleAckMessage(message: any) {
      console.log('Received ack message:', message);
    }

    public async subscribe(topic: string, fun: (data: any)=>void, privateChannel = false, response = true) {
      while(!this.id)await sleep(1);

      const message = {
        id: this.id, 
        type: 'subscribe',
        topic,
        privateChannel,
        response,
      };

      this.topic[topic] = fun;
      this.socket.send(JSON.stringify(message));
    }

    public ping() {
      const message = {
        id: this.id,
        type: 'ping',
      };
      this.socket.send(JSON.stringify(message));
    }
}