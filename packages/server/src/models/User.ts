import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar' })
  email: string

  @Column({ type: 'datetime' })
  createdAt: Date
}
