import * as crypto from 'node:crypto';
import DBEntity from './DBEntity';

export type UserEntity = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subscribedToUserIds: string[];
};
type CreateUserDTO = Omit<UserEntity, 'id' | 'subscribedToUserIds'>;
type ChangeUserDTO = Partial<Omit<UserEntity, 'id'>>;

export default class DBUsers extends DBEntity<
  UserEntity,
  ChangeUserDTO,
  CreateUserDTO
> {
  /* field db  */

  entities: UserEntity[] = [
    {
      id: 'b9458600-0b2d-4443-9f46-9e67f9b031dd',
      firstName: 'Alex',
      lastName: 'Ivanov',
      email: 'aaaaa@gmail.com',
      subscribedToUserIds: [],
    },
    {
      id: '8f75b3d5-5105-464b-a507-2763bcdaf905',
      firstName: 'Marina',
      lastName: 'Pov',
      email: 'bbbbbbbb@gmail.com',
      subscribedToUserIds: [
        'b9458600-0b2d-4443-9f46-9e67f9b031dd',
        '50ca930f-824e-4cf4-88e5-f21d88890aa8',
      ],
    },
    {
      id: '50ca930f-824e-4cf4-88e5-f21d88890aa8',
      firstName: 'Alina',
      lastName: 'Cabaeva',
      email: 'azaza@gmail.com',
      subscribedToUserIds: [],
    },
  ];

  /* field db  */

  async create(dto: CreateUserDTO) {
    const created: UserEntity = {
      ...dto,
      subscribedToUserIds: [],
      id: crypto.randomUUID(),
    };
    this.entities.push(created);
    return created;
  }
}
