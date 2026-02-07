import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

const parseLocalDate = (dateStr: string | Date) => {
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
        return new Date(y, m - 1, d);
    }
    return new Date(dateStr);
};

const getWeekRangeStr = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Sunday is 0
    const start = new Date(new Date(date).setDate(diff));
    start.setHours(0, 0, 0, 0);
    const end = new Date(new Date(start).setDate(start.getDate() + 6));
    end.setHours(23, 59, 59, 999);
    const opts: any = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('es-ES', opts)} - ${end.toLocaleDateString('es-ES', opts)}`;
};

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
            const dateObj = parseLocalDate(date);
            const newTx = await prisma.transaction.create({
                data: {
                    date: dateObj,
                    category,
                    sub,
                    amount: parseFloat(amount),
                    notes,
                    week: week || getWeekRangeStr(dateObj),
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
            const dateObj = parseLocalDate(date);
            const weekStr = getWeekRangeStr(dateObj);

            const updatedTx = await prisma.transaction.update({
                where: { id: Number(id) },
                data: {
                    date: dateObj,
                    category,
                    sub,
                    amount: parseFloat(amount),
                    notes,
                    isPaid,
                    week: weekStr
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


