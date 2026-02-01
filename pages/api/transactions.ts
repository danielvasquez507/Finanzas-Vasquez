import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            const transactions = await prisma.transaction.findMany({
                orderBy: { date: 'desc' }
            });
            // Convert Decimal to number for frontend
            const sanitized = transactions.map(t => ({
                ...t,
                amount: Number(t.amount)
            }));
            res.status(200).json(sanitized);
        } catch (error) {
            console.error('API GET Error:', error);
            res.status(500).json({ error: 'Failed to fetch transactions' });
        }
    } else if (req.method === 'POST') {
        try {
            const { date, category, sub, amount, notes, week, isPaid } = req.body;
            const newTx = await prisma.transaction.create({
                data: {
                    date: new Date(date),
                    category,
                    sub,
                    amount: parseFloat(amount),
                    notes,
                    week: week || getWeekString(new Date(date)),
                    isPaid: isPaid || false
                },
            });
            res.status(201).json({ ...newTx, amount: Number(newTx.amount) });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create transaction' });
        }
    } else if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await prisma.transaction.delete({
                where: { id: Number(id) },
            });
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete transaction' });
        }
    } else if (req.method === 'PUT') {
        const { id } = req.query;
        try {
            const { date, category, sub, amount, notes, isPaid } = req.body;
            const updatedTx = await prisma.transaction.update({
                where: { id: Number(id) },
                data: {
                    date: new Date(date),
                    category,
                    sub,
                    amount: parseFloat(amount),
                    notes,
                    isPaid
                },
            });
            res.status(200).json({ ...updatedTx, amount: Number(updatedTx.amount) });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update transaction' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

// Helper to calc week if not provided
const getWeekString = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date.getTime() - firstDay.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
    return `W${weekNum}`;
};
