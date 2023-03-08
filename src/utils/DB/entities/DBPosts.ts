import * as crypto from 'node:crypto';
import DBEntity from './DBEntity';

export type PostEntity = {
  id: string;
  title: string;
  content: string;
  userId: string;
};
export type CreatePostDTO = Omit<PostEntity, 'id'>;
export type ChangePostDTO = Partial<Omit<PostEntity, 'id' | 'userId'>>;

export default class DBPosts extends DBEntity<
  PostEntity,
  ChangePostDTO,
  CreatePostDTO
> {
  entities = [
    {
      id: '3fd71b5b-139a-4c69-b21f-52e5ef41c6c1',
      title: 'Post title1',
      content: 'Post description1',
      userId: 'b9458600-0b2d-4443-9f46-9e67f9b031dd',
    },
  ];

  async create(dto: CreatePostDTO) {
    const created: PostEntity = {
      ...dto,
      id: crypto.randomUUID(),
    };
    this.entities.push(created);
    return created;
  }
}
