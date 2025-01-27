import { MessageService } from "../message.service";
import { Message } from "../schemas/message.schema";

export class MessageArray {
  private array: Message[] = [];

  *[Symbol.iterator]() {
    for (const message of this.array) {
      yield message;
    }
  }
  
  constructor(
    private readonly messageService: MessageService,
  ) { }

  push(item: Message): number {
    this.addMessage(item);
    return this.array.push(item);
  }

  concat(items: Message[]): number {
    this.array = this.array.concat(items);
    return this.array.length;
  }

  getArray(): Message[] {
    return this.array;
  }

  sort(compareFunction?: (a: Message, b: Message) => number): Message[] {
    return this.array.sort(compareFunction);
  }

  async addMessage(message: Message) {
    this.messageService.create(message);
  }
}