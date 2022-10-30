import { ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export const singlePostInterceptor = FileInterceptor('file', {
  limits: {
    fieldSize: 10000,
  },
  fileFilter(_, file, callback) {
    console.log(file);
    if (file.mimetype === 'image/png') {
      return callback(null, true);
    }
    if (file.mimetype === 'image/jpg') {
      return callback(null, true);
    }
    if (file.mimetype === 'image/jpeg') {
      return callback(null, true);
    }

    return callback(new ForbiddenException('Unknown file format'), false);
  },
  storage: diskStorage({
    filename(_, file, callback) {
      file.filename = `insta-static-${1}-${Date.now()}.webp`;
      callback(null, file.filename);
    },
    destination: './upload',
  }),
});
