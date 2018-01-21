import { socket } from 'zeromq';
import { parseBuffer } from './util';
import { setTimeout, clearTimeout } from 'timers';
import { EventEmitter } from 'events';

interface ReqSocket extends EventEmitter {
  connect: (url: string) => void;
  send: (message: string) => void;
  disconnect: (url: string) => void;
  close: () => void;
}

export default class ZmqRequester {
  private socket: ReqSocket;

  constructor(private readonly url: string, private readonly timeout: number = 5000) {
    this.socket = socket('req');
    this.socket.connect(this.url);
  }

  async request(message: any): Promise<any> {
    const reply = await new Promise<Buffer>((resolve, reject) => {
      const rejectTimer = setTimeout(() => reject(new Error('Request timed out.')), this.timeout);
      const clearTimer = () => clearTimeout(rejectTimer);
      this.socket.once('message', message => {
        clearTimer();
        resolve(message);
      });
      this.socket.send(JSON.stringify(message));
    });
    const parsed = parseBuffer(reply);
    if (parsed === undefined) {
      throw new Error('Invalid JSON string received.');
    }
    return parsed;
  }

  dispose() {
    this.socket.disconnect(this.url);
    this.socket.close();
  }
}
