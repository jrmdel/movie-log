import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICreateSessionDocument, ISession } from 'src/modules/account/account.model';
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

  public async findByRefreshTokenHash(refreshTokenHash: string): Promise<ISession | null> {
    return this.model.findOne({ refreshTokenHash }).lean().exec();
  }

  public async updateRefreshTokenHash(
    currentRefreshTokenHash: string,
    nextRefreshTokenHash: string,
    expiresAt: Date,
  ): Promise<ISession | null> {
    return this.model
      .findOneAndUpdate(
        { refreshTokenHash: currentRefreshTokenHash },
        { refreshTokenHash: nextRefreshTokenHash, expiresAt },
        { returnDocument: 'after' },
      )
      .lean()
      .exec();
  }

  public async deleteByRefreshTokenHash(refreshTokenHash: string, userId: string): Promise<void> {
    await this.model.deleteOne({ refreshTokenHash, userId }).exec();
  }

  public async deleteAllForUser(userId: string): Promise<void> {
    await this.model.deleteMany({ userId }).exec();
  }
}
