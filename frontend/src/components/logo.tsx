import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <div>
      <Link to="/">
        <img src="/logo2.png" alt="Logo" width={130} height={130} />
        {/* <img src="/logo.svg" alt="Logo" width={130} height={130} /> */}
      </Link>
    </div>
  );
};
