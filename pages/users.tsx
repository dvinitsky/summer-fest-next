import { dehydrate, QueryClient, useMutation, useQuery } from 'react-query';
import axios from 'axios';
import { Group } from '../src/types/Group';
import { User } from '../src/types/User';
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';
import { fetchAllAdmins, fetchAllUsers } from '../src/queries/users';
import { fetchAllGroups } from '../src/queries/groups';
import { PageHeader } from '../src/components/PageHeader';
import { getIsAdminFromContext } from '../src/helpers';
import { withAdmin } from '../src/components/withAdmin';
import { UserRole } from '../src/types/UserRole';
import { useAppContext } from '../src/context/AppContext';

const Users = () => {
  const { setToastMessage } = useAppContext();

  const { data: groups = [] } = useQuery<Group[]>('allGroups', () =>
    fetchAllGroups()
  );
  const { data: users = [] } = useQuery<User[]>('allUsers', () =>
    fetchAllUsers()
  );
  const { data: admins = [] } = useQuery<UserRole[]>('allAdmins', () =>
    fetchAllAdmins()
  );

  const makeAdminMutation = useMutation(
    async ({ userId }: { userId: string }) =>
      await axios.post(`/api/makeAdmin`, { userId }),
    {
      onSuccess: ({ data }) => {
        setToastMessage(`${data.userName} is now an Admin.`);
      },
    }
  );

  const deleteUserMutation = useMutation(
    async ({ userId }: { userId: string }) =>
      await axios.delete(`/api/deleteUser?id=${userId}`),
    {
      onSuccess: ({ data }) => {
        setToastMessage(`${data.userName} deleted.`);
      },
    }
  );

  const getGroupName = (groups: Group[], user: User) => {
    const group = groups.find((g) => g.id === user.user_metadata.group_id);
    return group?.group_name;
  };

  return (
    <>
      <PageHeader />
      <TableContainer component={Paper} sx={{ marginTop: '80px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User Name</TableCell>
              <TableCell>Group Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: User) => {
              const isCurrentUserAdmin = admins.find(
                (admin) => admin.user_id === user.user_id
              );

              return (
                <TableRow key={user.user_id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{getGroupName(groups, user)}</TableCell>
                  <TableCell>
                    {isCurrentUserAdmin ? 'Admin' : 'Leader'}
                  </TableCell>
                  <TableCell>
                    {!isCurrentUserAdmin && (
                      <Button
                        className="table-name"
                        onClick={() =>
                          makeAdminMutation.mutate({ userId: user.user_id })
                        }
                        type="button"
                      >
                        MAKE ADMIN (cannot be undone)
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {!isCurrentUserAdmin && (
                      <Button
                        className="table-name"
                        onClick={() =>
                          deleteUserMutation.mutate({ userId: user.user_id })
                        }
                        type="button"
                      >
                        DELETE USER (cannot be undone)
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async (context: GetServerSidePropsContext) => {
    const sessionCookie = context.req.headers.cookie;
    const isAdmin = getIsAdminFromContext(context);

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery('allGroups', () =>
      fetchAllGroups(sessionCookie)
    );
    await queryClient.prefetchQuery('allUsers', () =>
      fetchAllUsers(sessionCookie)
    );
    await queryClient.prefetchQuery('allAdmins', () =>
      fetchAllAdmins(sessionCookie)
    );

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        isAdmin,
      },
    };
  },
});

export default withAdmin(Users);
