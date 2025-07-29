import { IsString } from 'class-validator';

export class UploadAudioDto {
  @IsString()
  fileUrl: string;
} 