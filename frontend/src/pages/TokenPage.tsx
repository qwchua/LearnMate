import { fetchAuthSession } from "aws-amplify/auth";

const TokenPage = () => {
  const getToken = async () => {
    const session = await fetchAuthSession();
    // const accessToken: string = session?.tokens?.accessToken.toString();
    const accessToken = session?.tokens?.idToken?.toString();
    console.log(accessToken);
  };
  getToken();
  return <div>test</div>;
};

export default TokenPage;
