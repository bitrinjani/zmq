import { socket } from 'zeromq';
import { parseBuffer } from './util';
import { EventEmitter } from 'events';

interface RepSocket extends EventEmitter {
  bindSync: (url: string) => void;
  send: (message: string) => void;
  unbindSync: (url: string) => void;
  close: () => void;
}

export default class ZmqResponder {
  private responder: RepSocket;

  constructor(
    private readonly url,
    private readonly handler: (request, respond: (response) => void) => void
  ) {
    this.responder = socket('rep');
    this.responder.on('message', message => this.parser(message));
    this.responder.bindSync(this.url);
  }

  dispose() {
    this.responder.unbindSync(this.url);
    this.responder.close();
  }

  private parser(message: Buffer) {
    const parsed = parseBuffer(message);
    this.handler(parsed, response => this.respond(response));
  }

  private respond(message: any) {
    this.responder.send(JSON.stringify(message));
  }
}
