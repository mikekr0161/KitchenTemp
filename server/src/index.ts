import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import organisationRoutes from './modules/organisations/organisations.routes';
import locationRoutes from './modules/locations/locations.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import checklistRoutes from './modules/checklists/checklists.routes';
import temperatureRoutes from './modules/temperature/temperature.routes';
import wasteRoutes from './modules/waste/waste.routes';
import menuRoutes from './modules/menu/menu.routes';
import shiftRoutes from './modules/shifts/shifts.routes';
import trainingRoutes from './modules/training/training.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes';
import overviewRoutes from './modules/overview/overview.routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, KitchenControl Pro!');
});

app.use('/api/auth', authRoutes);
app.use('/api/organisations', organisationRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api', temperatureRoutes);
app.use('/api', wasteRoutes);
app.use('/api', menuRoutes);
app.use('/api', shiftRoutes);
app.use('/api', trainingRoutes);
app.use('/api', notificationRoutes);
app.use('/api', leaderboardRoutes);
app.use('/api/experience', overviewRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
