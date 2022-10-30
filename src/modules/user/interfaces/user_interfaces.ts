import { Payload } from 'src/types';

export interface SomethingQuery {
  leaderId: number;
}

export type CustomRequest = Request & { user: Payload };
