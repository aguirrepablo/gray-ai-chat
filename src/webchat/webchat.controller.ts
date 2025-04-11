import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WebchatService } from './webchat.service';
import { CreateWebchatDto } from './dto/create-webchat.dto';
import { UpdateWebchatDto } from './dto/update-webchat.dto';

@Controller('webchat')
export class WebchatController {
  constructor(private readonly webchatService: WebchatService) {}

  @Post()
  create(@Body() createWebchatDto: CreateWebchatDto) {
    return this.webchatService.create(createWebchatDto);
  }

  @Get()
  findAll() {
    return this.webchatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.webchatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWebchatDto: UpdateWebchatDto) {
    return this.webchatService.update(+id, updateWebchatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.webchatService.remove(+id);
  }
}
