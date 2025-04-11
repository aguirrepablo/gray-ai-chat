import { Injectable } from '@nestjs/common';
import { CreateWebchatDto } from './dto/create-webchat.dto';
import { UpdateWebchatDto } from './dto/update-webchat.dto';

@Injectable()
export class WebchatService {
  create(createWebchatDto: CreateWebchatDto) {
    return 'This action adds a new webchat';
  }

  findAll() {
    return `This action returns all webchat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} webchat`;
  }

  update(id: number, updateWebchatDto: UpdateWebchatDto) {
    return `This action updates a #${id} webchat`;
  }

  remove(id: number) {
    return `This action removes a #${id} webchat`;
  }
}
