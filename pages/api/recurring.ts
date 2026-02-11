import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            const items = await prisma.recurring.findMany({
                where: { deletedAt: null }
            });
            const sanitized = items.map(i => ({ ...i, amount: Number(i.amount) }));
            res.status(200).json(sanitized);
        } catch (error) {
            console.error('Recurring GET error:', error);
            res.status(500).json({ error: 'Failed to fetch recurring' });
        }
    } else if (req.method === 'POST') {
        try {
            const { id, type, name, amount, owner, updatedBy, category, sub } = req.body;

            let parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount)) parsedAmount = 0;

            const recData = {
                type,
                name,
                amount: parsedAmount,
                owner,
                category: type === 'expense' ? category : null, // Only expenses have categories
                sub: type === 'expense' ? sub : null
            };

            let newItem;
            if (id) {
                newItem = await prisma.recurring.upsert({
                    where: { id },
                    update: recData,
                    create: { ...recData, id }
                });
            } else {
                newItem = await prisma.recurring.create({
                    data: recData
                });
            }

            await prisma.auditLog.create({
                data: {
                    action: id ? 'UPSERT' : 'CREATE',
                    entity: 'Recurring',
                    entityId: newItem.id,
                    details: JSON.stringify({ name, amount, type, category, sub, updatedBy })
                }
            });

            res.status(201).json({ ...newItem, amount: Number(newItem.amount) });
        } catch (error) {
            console.error('Recurring create error:', error);
            res.status(500).json({ error: 'Failed to create recurring' });
        }
    } else if (req.method === 'DELETE') {
        const { id, user: updatedBy } = req.query;
        if (!id) return res.status(400).json({ error: 'Missing ID' });

        const idStr = Array.isArray(id) ? id[0] : id;

        try {
            await prisma.recurring.update({
                where: { id: idStr as string },
                data: { deletedAt: new Date() }
            });

            await prisma.auditLog.create({
                data: {
                    action: 'DELETE',
                    entity: 'Recurring',
                    entityId: idStr,
                    details: JSON.stringify({ message: 'Soft deleted via API', updatedBy })
                }
            });

            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete recurring' });
        }
    } else if (req.method === 'PUT') {
        const { id, type, name, amount, owner, updatedBy, category, sub } = req.body;

        let parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount)) parsedAmount = 0;

        try {
            const updated = await prisma.recurring.update({
                where: { id: id as string },
                data: {
                    type,
                    name,
                    amount: parsedAmount,
                    owner,
                    category: type === 'expense' ? category : null,
                    sub: type === 'expense' ? sub : null
                }
            });

            await prisma.auditLog.create({
                data: {
                    action: 'UPDATE',
                    entity: 'Recurring',
                    entityId: id.toString(),
                    details: JSON.stringify({ name, amount, category, sub, updatedBy })
                }
            });

            res.status(200).json({ ...updated, amount: Number(updated.amount) });
        } catch (e) {
            console.error('Recurring PUT error:', e);
            res.status(500).json({ error: 'Update failed' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
