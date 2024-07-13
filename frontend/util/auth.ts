import { fetchAuthSession } from "aws-amplify/auth";

export const getAccessToken = async () => {
  try {
    const session = await fetchAuthSession();
    const accessToken = session?.tokens?.idToken?.toString();
    return accessToken;
  } catch (error) {
    console.error("Error fetching auth session:", error);
    throw error;
  }
};
