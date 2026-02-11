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
                where: { deletedAt: null },
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
            const { id, date, category, sub, amount, notes, week, isPaid, owner, updatedBy } = req.body;
            const dateObj = parseLocalDate(date);
            const weekStr = week || getWeekRangeStr(dateObj);

            // Use upsert to handle sync retries (idempotency)
            const txData = {
                date: dateObj,
                category,
                sub,
                amount: parseFloat(amount),
                notes,
                week: weekStr,
                isPaid: isPaid || false,
                owner: owner || 'Daniel'
            };

            let finalTx;
            if (id) {
                finalTx = await prisma.transaction.upsert({
                    where: { id },
                    update: txData,
                    create: { ...txData, id }
                });
            } else {
                finalTx = await prisma.transaction.create({
                    data: txData
                });
            }

            await prisma.auditLog.create({
                data: {
                    action: id ? 'UPSERT' : 'CREATE',
                    entity: 'Transaction',
                    entityId: finalTx.id.toString(),
                    details: JSON.stringify({ amount, category, date: dateObj, updatedBy })
                }
            });

            res.status(201).json({ ...finalTx, amount: Number(finalTx.amount) });
        } catch (error) {
            console.error('Transaction create error:', error);
            res.status(500).json({ error: 'Failed to create transaction' });
        }
    } else if (req.method === 'DELETE') {
        const { id, user: updatedBy } = req.query;
        try {
            await prisma.transaction.update({
                where: { id: id as string },
                data: { deletedAt: new Date() }
            });

            await prisma.auditLog.create({
                data: {
                    action: 'DELETE',
                    entity: 'Transaction',
                    entityId: id as string,
                    details: JSON.stringify({ message: 'Soft deleted via API', updatedBy })
                }
            });

            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete transaction' });
        }
    } else if (req.method === 'PUT') {
        const { id } = req.query;
        try {
            const { date, category, sub, amount, notes, isPaid, owner, updatedBy } = req.body;
            const dateObj = parseLocalDate(date);
            const weekStr = getWeekRangeStr(dateObj);

            const updatedTx = await prisma.transaction.update({
                where: { id: id as string },
                data: {
                    date: dateObj,
                    category,
                    sub,
                    amount: parseFloat(amount),
                    notes,
                    isPaid,
                    week: weekStr,
                    owner: owner
                },
            });

            await prisma.auditLog.create({
                data: {
                    action: 'UPDATE',
                    entity: 'Transaction',
                    entityId: id as string,
                    details: JSON.stringify({ amount, category, updatedBy })
                }
            });

            res.status(200).json({ ...updatedTx, amount: Number(updatedTx.amount) });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update transaction' });
        }
    }
    else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}


