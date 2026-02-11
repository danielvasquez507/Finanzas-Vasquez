import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

const INITIAL_CATEGORIES = [
    { name: 'Personal Daniel', iconKey: 'briefcase', color: 'bg-blue-100 text-blue-600', subs: ['Almuerzo', 'Ropa', 'Salida', 'Varios'] },
    { name: 'Personal Gedalya', iconKey: 'heart', color: 'bg-purple-100 text-purple-600', subs: ['Estética', 'Ropa', 'Salida', 'Cuidado'] },
    { name: 'Personal Ambos', iconKey: 'home', color: 'bg-emerald-100 text-emerald-600', subs: ['Cena', 'Cine', 'Regalos', 'Casa'] },
    { name: 'Supermercado', iconKey: 'shopping-cart', color: 'bg-orange-100 text-orange-600', subs: ['Super Carnes', 'El Rey', 'Riba Smith', 'PriceSmart', 'Chino'] },
    { name: 'Servicios', iconKey: 'zap', color: 'bg-yellow-100 text-yellow-600', subs: ['Naturgy', 'Internet', 'Agua', 'Celular'] },
    { name: 'Automóvil', iconKey: 'car', color: 'bg-red-100 text-red-600', subs: ['Gasolina', 'Peajes', 'Mantenimiento', 'Seguro'] },
    { name: 'Salud', iconKey: 'stethoscope', color: 'bg-pink-100 text-pink-600', subs: ['Farmacia', 'Cita Médica', 'Laboratorio'] },
    { name: 'Tarjeta Crédito', iconKey: 'credit-card', color: 'bg-slate-100 text-slate-600', subs: ['Anualidad', 'Seguro', 'Intereses'] },
];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'GET') {
        try {
            // First check if any categories exist (even deleted ones) to decide seeding
            const totalCount = await prisma.category.count();

            if (totalCount === 0) {
                // Seed if empty

                for (const cat of INITIAL_CATEGORIES) {
                    try {
                        const existing = await prisma.category.findUnique({ where: { name: cat.name } });
                        if (!existing) {
                            await prisma.category.create({
                                data: {
                                    name: cat.name,
                                    iconKey: cat.iconKey,
                                    color: cat.color,
                                    subs: JSON.stringify(cat.subs)
                                }
                            });
                        }
                    } catch (seedError) {
                        console.error(`Failed to seed category ${cat.name}:`, seedError);
                    }
                }
            }

            // Fetch only non-deleted
            const categories = await prisma.category.findMany({
                where: { deletedAt: null }
            });

            const parsed = categories.map(c => ({
                ...c,
                subs: JSON.parse(c.subs)
            }));
            res.status(200).json(parsed);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
    } else if (req.method === 'POST') {
        const { id, name, iconKey, color, subs, updatedBy } = req.body;
        try {
            const catData = {
                name,
                iconKey,
                color,
                subs: JSON.stringify(subs || [])
            };

            let newCat;
            if (id) {
                newCat = await prisma.category.upsert({
                    where: { id },
                    update: catData,
                    create: { ...catData, id }
                });
            } else {
                newCat = await prisma.category.create({
                    data: catData
                });
            }

            await prisma.auditLog.create({
                data: {
                    action: id ? 'UPSERT' : 'CREATE',
                    entity: 'Category',
                    entityId: newCat.id,
                    details: JSON.stringify({ name, color, updatedBy })
                }
            });

            res.status(201).json({ ...newCat, subs: JSON.parse(newCat.subs) });
        } catch (e) {
            console.error('Category create error:', e);
            res.status(500).json({ error: 'Creation failed' });
        }
    } else if (req.method === 'DELETE') {
        const { id, user: updatedBy } = req.query;
        if (!id) return res.status(400).json({ error: 'Missing ID' });

        const idStr = Array.isArray(id) ? id[0] : id;

        try {
            // Soft Delete
            await prisma.category.update({
                where: { id: idStr as any },
                data: { deletedAt: new Date() }
            });

            await prisma.auditLog.create({
                data: {
                    action: 'DELETE',
                    entity: 'Category',
                    entityId: idStr,
                    details: JSON.stringify({ message: 'Soft deleted via API', updatedBy })
                }
            });
            res.status(200).json({ success: true });
        } catch (e) {
            res.status(500).json({ error: 'Delete failed' });
        }
    } else if (req.method === 'PUT') {
        // Update subs, icon, name, color
        const { id, subs, iconKey, name, color, updatedBy } = req.body;
        try {
            const updated = await prisma.category.update({
                where: { id: id as any },
                data: {
                    subs: JSON.stringify(subs),
                    iconKey,
                    name,
                    color
                }
            });

            await prisma.auditLog.create({
                data: {
                    action: 'UPDATE',
                    entity: 'Category',
                    entityId: id,
                    details: JSON.stringify({ name, subs: subs?.length, updatedBy })
                }
            });

            res.status(200).json({ ...updated, subs: JSON.parse(updated.subs) });
        } catch (e) {
            res.status(500).json({ error: 'Update failed' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
