import { db } from "./db";
import {
  users,
  dailyCheckins,
  amandaChats,
  type User,
  type InsertUser,
  type Checkin,
  type CreateCheckinRequest,
  type Chat,
  type CreateChatRequest
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCheckins(userId: number): Promise<Checkin[]>;
  createCheckin(checkin: CreateCheckinRequest): Promise<Checkin>;
  
  getChats(userId: number): Promise<Chat[]>;
  createChat(chat: CreateChatRequest): Promise<Chat>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCheckins(userId: number): Promise<Checkin[]> {
    return await db.select().from(dailyCheckins).where(eq(dailyCheckins.userId, userId));
  }

  async createCheckin(checkin: CreateCheckinRequest): Promise<Checkin> {
    const [newCheckin] = await db.insert(dailyCheckins).values(checkin).returning();
    return newCheckin;
  }

  async getChats(userId: number): Promise<Chat[]> {
    return await db.select().from(amandaChats).where(eq(amandaChats.userId, userId));
  }

  async createChat(chat: CreateChatRequest): Promise<Chat> {
    const [newChat] = await db.insert(amandaChats).values(chat).returning();
    return newChat;
  }
}

export const storage = new DatabaseStorage();
