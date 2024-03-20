import { error } from "console";
import { WebSocket } from "ws";
import sleep from "../sleep.js";
export default class KucoinWebSocket {
    static BASE_URL = 'https://api-futures.kucoin.com';
    id = null;
    token;
    endpoint;
    pingInterval;
    socket;
    topic = {};
    constructor(token, endpoint, pingInterval) {
        this.token = token;
        this.endpoint = endpoint;
        this.pingInterval = pingInterval;
        this.socket = new WebSocket(`${this.endpoint}?token=${token}`);
        this.socket.onopen = (event) => this.onOpen(event);
        this.socket.onclose = (event) => this.onClose(event);
        this.socket.onmessage = (event) => this.onMessage(event);
        this.socket.onerror = (event) => this.onError(event);
    }
    static async createWebSocket() {
        const res = await (await fetch(`${this.BASE_URL}/api/v1/bullet-public`, { method: 'POST' })).json();
        if (res.code !== '200000')
            throw error(`createWebSocket res.code === ${res.code}`);
        const token = res.data.token;
        const endpoint = res.data.instanceServers[0].endpoint;
        const pingInterval = res.data.instanceServers[0].pingInterval;
        console.log(endpoint);
        return new KucoinWebSocket(token, endpoint, pingInterval);
    }
    onOpen(event) {
        console.log('WebSocket connection opened');
    }
    onClose(event) {
        console.log('WebSocket connection closed');
        console.log('WebSocket connection closed');
        console.log(JSON.stringify(event.code));
        console.log(JSON.stringify(event.reason));
        console.log(JSON.stringify(event.target));
        console.log(JSON.stringify(event.type));
        console.log(JSON.stringify(event.wasClean));
    }
    onMessage(event) {
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
    onError(event) {
        console.error('WebSocket error:', event);
        console.log(event);
    }
    handleWelcomeMessage(message) {
        console.log('Received welcome message:', message);
        this.id = message.id;
        setInterval(() => this.ping(), this.pingInterval / 2);
    }
    handlePongMessage(message) {
        console.log('Received pong message:', message);
    }
    handleAckMessage(message) {
        console.log('Received ack message:', message);
    }
    async subscribe(topic, fun, privateChannel = false, response = true) {
        while (!this.id)
            await sleep(1);
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
    ping() {
        const message = {
            id: this.id,
            type: 'ping',
        };
        this.socket.send(JSON.stringify(message));
    }
}
