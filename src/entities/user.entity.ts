import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { Blog } from './blog.entity';

// Enum for provider
export enum Provider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  profileUrl: string;

  @Column({
    type: 'enum',
    enum: Provider,
    default: Provider.GOOGLE, // Default to 'google'
  })
  provider: Provider; // Use the enum for provider

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Establish OneToMany relationship with Blog
  @OneToMany(() => Blog, (blog) => blog.user)
  blogs: Blog[];
}
