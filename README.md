[![Build Status](https://travis-ci.org/bitrinjani/zmq.svg?branch=master)](https://travis-ci.org/bitrinjani/zmq) [![Coverage Status](https://coveralls.io/repos/github/bitrinjani/zmq/badge.svg?branch=master&i=2)](https://coveralls.io/github/bitrinjani/zmq?branch=master) [![npm version](https://badge.fury.io/js/%40bitr%2Fzmq.svg)](https://badge.fury.io/js/%40bitr%2Fzmq)

# Zeromq.js wrapper for async/await

## Install

```
npm install @bitr/zmq
```

## ZmqRequester

### Type definition

```typescript
export default class ZmqRequester<Request, Response> {
  constructor(url: string, timeout?: number);
  request(message: Request): Promise<Response>;
  dispose(): void;
}
```

### Example

```typescript
const requester = new ZmqRequester(url); // socket open + connect
const res = await requester.request({ type: 'get' }); // awaitable

// do domething with res...

requester.dispose(); // disconnect + close
```

## ZmqResponder

### Type definition

```typescript
export default class ZmqResponder<Request, Response> {
  constructor(url: string, handler: (request: Request | undefined, respond: (response: Response) => void) => void);
  dispose(): void;
  private parser(message);
  private respond(message);
}
```

The constructor reveals zeromq's `send` method through `handler`'s `respond` parameter. ([Revealing constructor pattern](https://blog.domenic.me/the-revealing-constructor-pattern/))

### Example

```typescript
// bind + set 'message' event handler
const responder = new ZmqResponder(url, (request, respond) => {
  if (request.type === 'get') {
    respond({ success: true, data: { a: 1 } });
  } else {
    respond({ success: false, reason: 'unknown type' });
  }
});

// responds requests...

responder.dispose(); // unbind + close
```

## ZmqPublisher / ZmqSubscriber

### Example

```typescript
  const url = 'tcp://127.0.0.1:9879';
  const topic = 'topic';
  const pub = new ZmqPublisher(url);
  const sub = new ZmqSubscriber(url);
  
  // register callback to handle message
  sub.subscribe(topic, message => {
    console.log(message);
  });  

  pub.publish(topic, 'any message');
  
  ...

  sub.unsubscribe(topic);
  sub.dispose();
  pub.dispose();
```
