import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { multerConfig } from 'src/config/multer.config';

@ApiBearerAuth()
@ApiTags('Upload File')
@Controller('upload')
export class UploadController {
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    type: 'file',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({
    status: 201,
    description: 'The file has been successfully uploaded.',
  })
  @ApiResponse({ status: 400, description: 'File is required' })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @UsePipes(new FileValidationPipe())
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'File uploaded successfully',
      file,
    };
  }
}
