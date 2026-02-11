import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            const users = await prisma.user.findMany({
                orderBy: { name: 'asc' }
            });
            res.status(200).json(users);
        } catch (error) {
            console.error('Users GET error:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    } else if (req.method === 'POST') {
        try {
            const { name, color } = req.body;
            const newUser = await prisma.user.create({
                data: { name, color }
            });
            res.status(201).json(newUser);
        } catch (error) {
            console.error('User create error:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    } else if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await prisma.user.delete({
                where: { id: id as string }
            });
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('User delete error:', error);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
