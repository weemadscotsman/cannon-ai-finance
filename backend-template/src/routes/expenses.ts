import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all expenses for user
router.get('/', async (req: any, res) => {
  try {
    const clerkId = req.auth.userId;
    
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { expenses: true }
    });

    if (!user) {
      // Create user on first request
      const newUser = await prisma.user.create({
        data: {
          clerkId,
          email: req.auth.email || 'unknown@example.com',
          plan: 'free',
          aiCreditsLimit: 50
        },
        include: { expenses: true }
      });
      return res.json(newUser.expenses);
    }

    res.json(user.expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Create expense
router.post('/', async (req: any, res) => {
  try {
    const clerkId = req.auth.userId;
    const { category, name, amount, frequency, icon, isRecurring } = req.body;

    // Check free tier limit
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { _count: { select: { expenses: true } } }
    });

    if (user?.plan === 'free' && user._count.expenses >= 100) {
      return res.status(403).json({ 
        error: 'Free tier limit reached',
        upgradeUrl: '/pricing'
      });
    }

    const expense = await prisma.expense.create({
      data: {
        userId: user!.id,
        category,
        name,
        amount,
        frequency,
        icon,
        isRecurring
      }
    });

    res.json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
router.put('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const clerkId = req.auth.userId;
    const updates = req.body;

    const user = await prisma.user.findUnique({ where: { clerkId } });
    
    const expense = await prisma.expense.updateMany({
      where: { id, userId: user!.id },
      data: updates
    });

    res.json({ success: true, updated: expense.count });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const clerkId = req.auth.userId;

    const user = await prisma.user.findUnique({ where: { clerkId } });
    
    await prisma.expense.deleteMany({
      where: { id, userId: user!.id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export { router as expensesRouter };
