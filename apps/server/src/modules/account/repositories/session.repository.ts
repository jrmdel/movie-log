import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ICreateSessionDocument,
  ISession,
} from 'src/modules/account/account.model';
import { SessionDocument } from 'src/modules/account/schemas/session.document';

export class SessionRepository {
  constructor(
    @InjectModel(SessionDocument.name)
    private readonly model: Model<SessionDocument>,
  ) {}

  public async create(session: ICreateSessionDocument): Promise<ISession> {
    const createdSession = await this.model.create(session);
    return createdSession.toObject();
  }

  public async findByRefreshToken(
    refreshToken: string,
  ): Promise<ISession | null> {
    return this.model.findOne({ refreshToken }).lean().exec();
  }

  public async updateRefreshToken(
    currentRefreshToken: string,
    nextRefreshToken: string,
    expiresAt: Date,
  ): Promise<ISession | null> {
    return this.model
      .findOneAndUpdate(
        { refreshToken: currentRefreshToken },
        { refreshToken: nextRefreshToken, expiresAt },
        { new: true },
      )
      .lean()
      .exec();
  }
}
