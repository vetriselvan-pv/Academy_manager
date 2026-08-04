import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  jti: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  jti: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
