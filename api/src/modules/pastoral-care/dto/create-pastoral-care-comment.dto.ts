import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePastoralCareCommentDto {
  @IsString()
  @IsNotEmpty()
  body!: string;
}
