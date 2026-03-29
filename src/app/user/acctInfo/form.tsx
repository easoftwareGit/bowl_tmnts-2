import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getUserById } from "@/lib/db/users/dbUsers";
import { blankUserData } from "@/lib/db/initVals";
import type { userDataType } from "@/lib/types/types";
import AcctInfo from "./acctInfo";
import ChangePassword from "./chgPwd";

type UserAcctInfoType = userDataType & {
  password_hash: string;
};

const blankAcctUser: UserAcctInfoType = {
  ...blankUserData,
  password_hash: "",
};

const AcctInfoForm = () => {
  const { data } = useSession();
  const userId = data?.user?.id || "";

  const [user, setUser] = useState<UserAcctInfoType>(blankAcctUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [origUserData, setOrigUserData] = useState<userDataType>(blankUserData);
  const [infoType, setInfoType] = useState("AcctInfo");

  useEffect(() => {
    const fetchOneUser = async () => {
      try {
        const response = await getUserById(userId);
        if (!response) {
          return;
        }

        const dbUser = response;

        const passwordHash =
          "password_hash" in dbUser && typeof dbUser.password_hash === "string"
            ? dbUser.password_hash
            : "";

        const userToSet: UserAcctInfoType = {
          ...blankAcctUser,
          id: dbUser.id,
          first_name: dbUser.first_name,
          last_name: dbUser.last_name,
          email: dbUser.email,
          phone: dbUser.phone || "",
          role: dbUser.role,
          password_hash: passwordHash,
        };

        const origUserToSet: userDataType = {
          id: dbUser.id,
          first_name: dbUser.first_name,
          last_name: dbUser.last_name,
          email: dbUser.email,
          phone: dbUser.phone || "",
          role: dbUser.role,
        };

        setUser(userToSet);
        setOrigUserData(origUserToSet);
      } catch {
        setError("Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchOneUser();
  }, [userId]);

  const setAcctUser = (nextUser: userDataType) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...nextUser,
      password_hash: prevUser.password_hash,
    }));
  };

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
            setUser={setAcctUser}
            origUserData={origUserData}
            setInfoType={setInfoType}
          />
        ) : null}

        {!loading && !error && infoType === "Password" ? (
          <ChangePassword
            user={user}
            setInfoType={setInfoType}
          />
        ) : null}
      </div>
    </>
  );
};

export default AcctInfoForm;
