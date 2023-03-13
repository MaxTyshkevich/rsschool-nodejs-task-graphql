import * as crypto from 'node:crypto';
import DBEntity from './DBEntity';

export type ProfileEntity = {
  id: string;
  avatar: string;
  sex: string;
  birthday: number;
  country: string;
  street: string;
  city: string;
  memberTypeId: string;
  userId: string;
};
export type CreateProfileDTO = Omit<ProfileEntity, 'id'>;
export type ChangeProfileDTO = Partial<Omit<ProfileEntity, 'id' | 'userId'>>;

export default class DBProfiles extends DBEntity<
  ProfileEntity,
  ChangeProfileDTO,
  CreateProfileDTO
> {
  entities = [
    {
      id: 'f896b226-2aa6-4f5a-83dd-50cca630f0b5',
      avatar: 'Alex Ivanov',
      sex: 'male',
      birthday: 123123,
      country: 'Minsk',
      street: 'raduznuy 123',
      city: 'sss',
      userId: 'b9458600-0b2d-4443-9f46-9e67f9b031dd',
      memberTypeId: 'business',
    },
    {
      id: 'f1a471c0-c02e-4036-bb51-80f60799d811',
      avatar: 'Marina Pov',
      sex: 'famile',
      birthday: 123123,
      country: 'Prague',
      street: 'Zvezda 100',
      city: 'lalal',
      userId: '8f75b3d5-5105-464b-a507-2763bcdaf905',
      memberTypeId: 'basic',
    },

    {
      id: 'f1a471c0-c02e-4036-bb51-80f60799d811',
      avatar: 'Alina Cabaeva',
      sex: 'famile',
      birthday: 123123,
      country: 'Russia',
      street: 'Zvezda 100',
      city: 'lalal',
      userId: '50ca930f-824e-4cf4-88e5-f21d88890aa8',
      memberTypeId: 'basic',
    },
  ];

  async create(dto: CreateProfileDTO) {
    const created: ProfileEntity = {
      ...dto,
      id: crypto.randomUUID(),
    };
    this.entities.push(created);
    return created;
  }
}
