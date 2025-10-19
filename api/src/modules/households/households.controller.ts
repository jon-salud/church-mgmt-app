import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { HouseholdsService } from './households.service';

@ApiTags('Households')
@UseGuards(AuthGuard)
@Controller('households')
export class HouseholdsController {
  constructor(private readonly service: HouseholdsService) {}

  @Get()
  @ApiOperation({ summary: 'List all households' })
  @ApiOkResponse({ description: 'A list of all households' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single household by ID' })
  @ApiOkResponse({ description: 'The household with the specified ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
