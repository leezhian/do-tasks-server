import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends OmitType(PartialType(CreateTaskDto), ['project_id']) {

}
