import { clients, refreshClients } from "../../private/clients.js";

export class App {
  client;
  customFunctions = [];

  constructor(config) {
    this.config = config;
    this.findClient();
  }

  async updateDefinitions() {
    if (!this.client) await this.findClient();
    if (!this.client) return;
    let result = await this.client.request("http", "request", [
      "POST",
      this.config.url,
      JSON.stringify({
        arguments: [this.config.pwd],
        export: "serviceStatus",
        module: "public/service.js",
      }),
      "application/json",
    ]);
    for (let functionName in this.definitions.methods)
      delete this[functionName];

    if (!result.result.success) return;

    let services = JSON.parse(result.result.response).data;
    this.updateDefinitions.methods = {};

    for (let service of services) {
      this.definitions.methods[service.service] = {
        arguments: [],
        name:
          service.service +
          " is " +
          (service.active ? "active" : "not active") +
          ". Change active status?",
      };

      this[service.service] = async () => {
        await this.client.request("http", "request", [
          "POST",
          this.config.url,
          JSON.stringify({
            arguments: [this.config.pwd, service.service],
            export: "changeServiceStatus",
            module: "public/service.js",
          }),
          "application/json",
        ]);
      };
    }
  }

  async findClient() {
    await refreshClients();
    if (clients[this.config.client]) this.client = clients[this.config.client];
  }
}
