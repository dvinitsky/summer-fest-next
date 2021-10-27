import { NextApiRequest, NextApiResponse } from 'next';
import User from '../../models/User';
import connectToDatabase from '../../util/mongodb';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const db = await connectToDatabase();

  try {
    const { insertedId } = await db
      .collection('users')
      .insertOne(new User(req.body));
    console.log('1 document inserted');

    const user = await db.collection('users').findOne({ _id: insertedId });

    res.json(user.id);
  } catch (error) {
    throw error;
  }
};