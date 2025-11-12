import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import organisationRoutes from './modules/organisations/organisations.routes';
import locationRoutes from './modules/locations/locations.routes';

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
