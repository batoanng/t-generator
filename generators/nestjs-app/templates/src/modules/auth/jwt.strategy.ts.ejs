import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as jwksRsa from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { z } from 'zod';

import type { Config } from '../../types/config';
import { Service } from '../tokens';

const jwtPayloadSchema = z
  .object({
    sub: z.string().optional(),
  })
  .passthrough();

type JwtPayload = z.infer<typeof jwtPayloadSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(Service.CONFIG) config: Config) {
    super({
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        jwksUri: `${config.OIDC_AUTHORITY}/.well-known/jwks.json`,
        cache: true,
        rateLimit: true,
      }),
      audience: config.OIDC_AUDIENCE,
      issuer: `${config.OIDC_AUTHORITY}/`,
      algorithms: ['RS256'],
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  validate(payload: unknown): JwtPayload {
    return jwtPayloadSchema.parse(payload);
  }
}
