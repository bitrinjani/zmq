import { ZmqRequester, ZmqResponder } from '../lib';
import { parseBuffer } from '../lib/util';

test('simple', async () => {
  const url = 'tcp://127.0.0.1:9876';
  const handler = (request, respond) => {
    switch (request.type) {
      case 'get':
        respond({ success: true, data: { a: 1 } });
        break;
      case 'set':
        respond({ success: false, reason: 'failed to set' });
        break;
      default:
        respond({ success: false, reason: 'default' });
    }
  };
  const responder = new ZmqResponder(url, handler);
  const requester = new ZmqRequester(url);

  let res = await requester.request({ type: 'get' });
  expect(res.success).toBe(true);
  expect(res.data.a).toBe(1);
  res = await requester.request({ type: 'set' });
  expect(res.success).toBe(false);
  expect(res.reason).toBe('failed to set');
  res = await requester.request('{{{invalid string');
  expect(res.success).toBe(false);
  expect(res.reason).toBe('default');
  responder.dispose();
  requester.dispose();
});

test('timeout', async () => {
  const url = 'tcp://127.0.0.1:9876';
  const handler = (request, respond) => {};
  const responder = new ZmqResponder(url, handler);
  const requester = new ZmqRequester(url, 100);
  try {
    let res = await requester.request({ type: 'get' });
    expect(true).toBe(false);
  } catch (ex) {
    expect(ex.message).toBe('Request timed out.')
  } finally {
    responder.dispose();
    requester.dispose();
  }
});

test('parseBuffer', () => {
  const result = parseBuffer(new Buffer('{{'));
  expect(result).toBe(undefined);
});
