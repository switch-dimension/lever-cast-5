import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type CreateUserData = {
    clerkId: string;
    email: string;
    name?: string | null;
};

export class UserService {
    /**
     * Creates a new user in the database
     * @param userData User data from Clerk
     * @returns The created user
     */
    static async createUser(userData: CreateUserData) {
        try {
            const user = await prisma.user.create({
                data: {
                    clerkId: userData.clerkId,
                    email: userData.email,
                    name: userData.name || null,
                },
            });
            return user;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                // Handle unique constraint violations
                if (error.code === 'P2002') {
                    throw new Error('A user with this email or clerk ID already exists');
                }
            }
            throw error;
        }
    }

    /**
     * Retrieves a user by their Clerk ID
     * @param clerkId The Clerk ID of the user
     * @returns The user or null if not found
     */
    static async getUserByClerkId(clerkId: string) {
        return await prisma.user.findUnique({
            where: { clerkId },
        });
    }

    /**
     * Retrieves a user by their internal ID
     * @param id The internal ID of the user
     * @returns The user or null if not found
     */
    static async getUserById(id: string) {
        return await prisma.user.findUnique({
            where: { id },
        });
    }

    /**
     * Updates a user's information
     * @param id The internal ID of the user
     * @param data The data to update
     * @returns The updated user
     */
    static async updateUser(id: string, data: Partial<CreateUserData>) {
        return await prisma.user.update({
            where: { id },
            data,
        });
    }
} 