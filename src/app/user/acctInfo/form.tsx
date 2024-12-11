import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { findUserById } from "@/lib/db/users/users";
import { blankUser } from "@/lib/db/initVals";
import AcctInfo from "./acctInfo";
import ChangePassword from "./chgPwd";

const AcctInfoForm = () => {

  const { status, data, update } = useSession();
  const userId = data?.user?.id || "";
  const [user, setUser] = useState(blankUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [origUserData, setOrigUserData] = useState(blankUser);
  const [infoType, setInfoType] = useState("AcctInfo");

  // const router = useRouter();

  useEffect(() => {
    const fetchOneUser = async () => {
      try {
        const response = await findUserById(userId);
        if (!response) {
          return;
        }
        const dbUser = response;
        const userToSet = {
          ...blankUser,
          first_name: dbUser.first_name,
          last_name: dbUser.last_name,
          email: dbUser.email,
          password_hash: dbUser.password_hash || "",
        };
        if (dbUser.phone) {
          userToSet.phone = dbUser.phone;
          // setPhoneRequired(true);
        }
        setUser(userToSet);
        setOrigUserData(userToSet);
      } catch (error) {
        setError("Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchOneUser();
  }, [userId]);

  return (
    <>
      <div>
        {infoType === "AcctInfo" ? (
          <h2 className="mb-3">Account Information</h2>
        ) : (
          <h2 className="mb-3">Change Password</h2>
        )}
        
        {loading && <div>Loading...</div>}
        {error && <div>Error: {error}</div>}
        {!loading && !error && infoType === "AcctInfo" ? (
          <AcctInfo
            user={user}
            setUser={setUser}
            origUserData={origUserData}
            infoType={infoType}
            setInfoType={setInfoType}
          />
        ) : null}

        {!loading && !error && infoType === "Password" ? (
          <>
            <ChangePassword
              user={user}
              infoType={infoType}
              setInfoType={setInfoType}
            />
          </>
        ) : null}

      </div>
    </>
  );
};

export default AcctInfoForm;
