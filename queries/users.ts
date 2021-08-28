/**
 *
 * @param groupId
 * @returns an async function which returns a list of users with the provided group id
 */
export const fetchGroupUsers = async (groupId: number) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/users?groupId=${groupId}`
  );
  return res.json();
};