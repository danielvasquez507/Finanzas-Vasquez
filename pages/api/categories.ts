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
            let categories = await prisma.category.findMany();
            if (categories.length === 0) {
                // Seed if empty
                for (const cat of INITIAL_CATEGORIES) {
                    await prisma.category.create({
                        data: {
                            name: cat.name,
                            iconKey: cat.iconKey,
                            color: cat.color,
                            subs: JSON.stringify(cat.subs)
                        }
                    });
                }
                categories = await prisma.category.findMany();
            }

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
        const { name, iconKey, color, subs } = req.body;
        try {
            const newCat = await prisma.category.create({
                data: {
                    name,
                    iconKey,
                    color,
                    subs: JSON.stringify(subs || [])
                }
            });
            res.status(201).json({ ...newCat, subs: JSON.parse(newCat.subs) });
        } catch (e) {
            res.status(500).json({ error: 'Creation failed' });
        }
    } else if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await prisma.category.delete({ where: { id: String(id) } });
            res.status(200).json({ success: true });
        } catch (e) {
            res.status(500).json({ error: 'Delete failed' });
        }
    } else if (req.method === 'PUT') {
        // Update subs, icon, name, color
        const { id, subs, iconKey, name, color } = req.body;
        try {
            const updated = await prisma.category.update({
                where: { id },
                data: {
                    subs: JSON.stringify(subs),
                    iconKey,
                    name,
                    color
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
