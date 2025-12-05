export const CHANNEL_NAME = 'smartfood_v4_channel';

class ChannelService {
  private channel: BroadcastChannel;

  constructor() {
    this.channel = new BroadcastChannel(CHANNEL_NAME);
  }

  postMessage(type: string, payload: any) {
    this.channel.postMessage({ type, payload });
  }

  onMessage(callback: (event: MessageEvent) => void) {
    this.channel.onmessage = callback;
  }

  close() {
    this.channel.close();
  }
}

export const channelService = new ChannelService();