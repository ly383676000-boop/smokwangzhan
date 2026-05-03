const axios = require('axios');

class FeishuService {
  constructor() {
    this.appId = null;
    this.appSecret = null;
    this.chatId = null;
    this.accessToken = null;
    this.tokenExpireTime = 0;
  }

  configure(appId, appSecret, chatId) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.chatId = chatId;
  }

  async getAccessToken() {
    if (!this.appId || !this.appSecret) {
      throw new Error('飞书应用未配置');
    }

    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        app_id: this.appId,
        app_secret: this.appSecret,
      });

      if (response.data.code !== 0) {
        throw new Error(`获取Token失败: ${response.data.msg}`);
      }

      this.accessToken = response.data.tenant_access_token;
      this.tokenExpireTime = Date.now() + (response.data.expire - 60) * 1000;
      return this.accessToken;
    } catch (error) {
      console.error('飞书Token获取失败:', error.message);
      throw error;
    }
  }

  async sendMessage(text) {
    if (!this.chatId) {
      console.warn('飞书聊天ID未配置，跳过消息发送');
      return;
    }

    try {
      const token = await this.getAccessToken();
      await axios.post(
        'https://open.feishu.cn/open-apis/im/v1/messages',
        {
          receive_id: this.chatId,
          receive_id_type: 'chat_id',
          content: JSON.stringify({
            text: text,
          }),
          msg_type: 'text',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('飞书消息发送成功');
    } catch (error) {
      console.error('飞书消息发送失败:', error.message);
    }
  }

  async sendOrderNotification(order) {
    const text = `
📦 新订单通知

订单号: ${order.id}
客户: ${order.customer_name}
邮箱: ${order.email}
电话: ${order.phone}
地址: ${order.address}
国家: ${order.country}

商品清单:
${order.items.map(item => `- ${item.name} x ${item.quantity} = ${item.price * item.quantity}`).join('\n')}

订单总额: ${order.total}
创建时间: ${new Date(order.created_at).toLocaleString('zh-CN')}
    `.trim();

    await this.sendMessage(text);
  }
}

module.exports = new FeishuService();