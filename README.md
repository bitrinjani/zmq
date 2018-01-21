# Zeromq.js wrapper for async/await

## ZmqRequester

### Type definition

```typescript
export default class ZmqRequester {
  constructor(url: string, timeout?: number);
  request(message: any): Promise<any>;
  dispose(): void;
}
```

### Example

```typescript
const requester = new ZmqRequester(url); // socket open + connect
const res = await requester.request({ type: 'get' }); // awaitable
// do domething with res
requester.dispose(); // disconnect + close
```

## ZmqResponder

### Type definition

```typescript
export default class ZmqResponder {
  constructor(url: any, handler: (request, respond: (response) => void) => void);
  respond(message: any): void;
  dispose(): void;
  private parser(message);
}
```

The constructor reveals zeromq's `send` method through `respond` parameter. ([Revealing constructor pattern](https://blog.domenic.me/the-revealing-constructor-pattern/))

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
