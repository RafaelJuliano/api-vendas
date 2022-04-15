import AppError from '@shared/errors/AppError';
import { classToClass } from 'class-transformer';
import { Request, Response } from 'express';
import UpdateUserAvatarService from '../services/UpdateUserAvatarService';

export default class UserAvatarController {
  public async update(request: Request, response: Response): Promise<Response> {
    const updateAvatar = new UpdateUserAvatarService();

    if (!request.file) {
      throw new AppError('Please provide an avatar image.', 400);
    }

    if (request.file.filename.includes(' ')) {
      throw new AppError('Invalid file name.', 400);
    }

    const user = await updateAvatar.execute({
      user_id: request.user.id,
      avatarFilename: request.file.filename,
    });

    return response.json(classToClass(user));
  }
}
