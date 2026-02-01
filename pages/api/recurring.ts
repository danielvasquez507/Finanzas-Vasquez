import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            const items = await prisma.recurring.findMany();
            const sanitized = items.map(i => ({ ...i, amount: Number(i.amount) }));
            res.status(200).json(sanitized);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch recurring' });
        }
    } else if (req.method === 'POST') {
        try {
            const { type, name, amount, owner } = req.body;
            const newItem = await prisma.recurring.create({
                data: {
                    type,
                    name,
                    amount: parseFloat(amount),
                    owner
                },
            });
            res.status(201).json({ ...newItem, amount: Number(newItem.amount) });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create recurring' });
        }
    } else if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await prisma.recurring.delete({
                where: { id: Number(id) },
            });
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete recurring' });
        }
    } else if (req.method === 'PUT') {
        const { id, type, name, amount, owner } = req.body;
        try {
            const updated = await prisma.recurring.update({
                where: { id: Number(id) },
                data: { type, name, amount: parseFloat(amount), owner }
            });
            res.status(200).json({ ...updated, amount: Number(updated.amount) });
        } catch (e) {
            res.status(500).json({ error: 'Update failed' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
