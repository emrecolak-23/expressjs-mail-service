import amqplib from "amqplib";

class Amqblib {
  private _connection?: amqplib.Connection;
  private _channel?: amqplib.Channel;

  get connection() {
    if (!this._connection) {
      throw new Error("Cannot access Rabbit Mq channel before connecting");
    }

    return this._connection;
  }

  getChannel() {
    return this._channel;
  }

  async connect(url: string) {
    try {
      this._connection = await amqplib.connect(url);
      console.log("Connected to RabbitMQ");
      this._channel = await this._connection.createChannel();
      return this._connection;
    } catch (err) {
      throw new Error("Connection to RabbitMQ failed");
    }
  }

  async close() {
    if (this._channel) {
      await this._channel.close();
    }
    if (this._connection) {
      await this._connection.close();
    }
  }

  public async checkRabbitMqConnection() {
    const connection = await amqplib.connect(process.env.AMQP_URI!);
    const channel = await connection.createChannel();
    await channel.assertQueue("test", { durable: true });
    await channel.close();
    await connection.close();
  }
}

export const rabbitMQ = new Amqblib();
export { Connection } from "amqplib";
