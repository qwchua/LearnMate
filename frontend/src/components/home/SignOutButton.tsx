import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "aws-amplify/auth";

export const SignoutButton = () => {
  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload(); // This will refresh the page and redirect to the login screen
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  return (
    <>
      <Button size="sm" variant="ghost" onClick={handleSignOut}>
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </>
  );
};
