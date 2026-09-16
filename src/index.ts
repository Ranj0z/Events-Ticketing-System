import express, { Request, Response, NextFunction } from 'express';
import UserRoutes from './AllTables/auth/auth.routes';
import paymentRoutes from './AllTables/payments/payment.routes';
import rsvpRoutes from './AllTables/rsvp/reservation.route';
import EventRoutes from './AllTables/events/events.route';
import VenueRoutes from './AllTables/venues/venue.route';
import TicketRoutes from './AllTables/tickets/ticket.route';
import UploadRoutes from './AllTables/uploads/upload.routes';
import TicketTypeRoutes from './AllTables/ticket_type/ticket-type.routes';
import EventImageRoutes from './AllTables/event_images/event-images.routes';
import cron from 'node-cron';
import { sweepExpiredHoldsService } from './AllTables/payments/payment.service';

const app = express();
import cors from "cors";
import { logger } from './middleware/logger';

app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
}));

app.use(logger);

  app.use(cors({
    origin: '*',
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  }));

// Routes
UserRoutes(app);
paymentRoutes(app);
rsvpRoutes(app);
EventRoutes(app);
VenueRoutes(app);
TicketRoutes(app);
UploadRoutes(app);
TicketTypeRoutes(app);
EventImageRoutes(app);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.use(((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (
    err instanceof SyntaxError &&
    (err as any).status === 400 &&
    'body' in err
  ) {
    return res.status(400).json({ message: 'Invalid JSON format' });
  }

  if (
    err &&
    typeof err === 'object' &&
    'name' in err &&
    (err as { name?: unknown }).name === 'MulterError'
  ) {
    const message =
      'message' in err && typeof (err as { message?: unknown }).message === 'string'
        ? (err as { message: string }).message
        : 'Invalid file upload';
    return res.status(400).json({ message });
  }

  if (err) {
    console.error('Unhandled error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }

  next();
}) as express.ErrorRequestHandler);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

app.listen(8090, () => {
  console.log('Server is running on http://localhost:8090');
});

// Releases capacity for any Pending booking whose 15-minute payment hold
// has lapsed with no resolved payment. Runs in-process — see
// payment.service.ts:sweepExpiredHoldsService for the release logic shared
// with the gateway webhook's failure branch.
cron.schedule('*/5 * * * *', async () => {
  try {
    const { releasedBatches, releasedRSVPs } = await sweepExpiredHoldsService();
    if (releasedBatches > 0) {
      console.log(`Expired-hold sweep: released ${releasedBatches} batch(es), ${releasedRSVPs} RSVP(s).`);
    }
  } catch (error) {
    console.error('Expired-hold sweep failed:', error);
  }
});

export default app;