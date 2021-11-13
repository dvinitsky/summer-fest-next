import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { fetchAuthTokens } from '../../src/queries/auth';
import { User } from '../../src/types/User';

export default withApiAuthRequired(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const tokenData = await fetchAuthTokens();

    const { name, email } = req.body;

    const { data: user } = await axios.post<User>(
      `${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/api/v2/users`,
      {
        connection: 'Username-Password-Authentication',
        name,
        email,
      },
      { headers: { authorization: `Bearer ${tokenData.access_token}` } }
    );
    res.json(user);
  }
);
