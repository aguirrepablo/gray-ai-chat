import { Test, TestingModule } from '@nestjs/testing';
import { BuilderbotService } from './builderbot.service';

describe('BuilderbotService', () => {
  let service: BuilderbotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuilderbotService],
    }).compile();

    service = module.get<BuilderbotService>(BuilderbotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
