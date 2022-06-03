import { Request } from '@nestjs/common';

export type RequestWithUser = Request & { user: { _id: string } };
