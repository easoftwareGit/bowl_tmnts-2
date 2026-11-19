"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getAcctUserById } from "@/lib/db/users/dbUsers";
import { blankUserData } from "@/lib/db/initVals";
import type { acctUserType } from "@/lib/types/types";
import WaitModal from "@/components/modal/waitModal";
import AcctInfo from "./acctInfo";
import ChangePassword from "./chgPwd";

const blankAcctUser: acctUserType = {
  ...blankUserData,
  has_password: false,
};

const AcctInfoForm = () => {
  const { data, status } = useSession();
  const userId = data?.user?.id || "";

  const [user, setUser] = useState<acctUserType>(blankAcctUser);
  const [origUserData, setOrigUserData] = useState<acctUserType>(blankAcctUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [infoType, setInfoType] = useState("AcctInfo");

  useEffect(() => {
    // the session is still loading; wait, don't fetch with a blank id
    if (status === "loading") return;

    if (status === "unauthenticated" || !userId) {
      setError("Not logged in");
      setLoading(false);
      return;
    }

    // ignore the result if the user id changes (or the page closes)
    // before this fetch finishes
    let ignore = false;

    const fetchOneUser = async () => {
      setLoading(true);
      setError("");
      try {
        const acctUser = await getAcctUserById(userId);
        if (ignore) return;
        // no user (e.g. deleted since sign-in); don't show a form built
        // from an empty object
        if (!acctUser) {
          setError("User not found");
          return;
        }
        const userToSet: acctUserType = {
          ...acctUser,
          phone: acctUser.phone || "",
        };
        setUser(userToSet);
        setOrigUserData(userToSet);
      } catch {
        if (!ignore) setError("Failed to fetch user");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchOneUser();
    return () => {
      ignore = true;
    };
  }, [status, userId]);

  // AcctInfo edits the public fields; has_password comes from the db and
  // never changes on this page, so always keep the loaded value
  const setAcctUser = (nextUser: acctUserType) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...nextUser,
      has_password: prevUser.has_password,
    }));
  };

  const showForms = !loading && !error;

  return (
    <div>
      <WaitModal show={loading} message="Loading..." />

      {infoType === "AcctInfo" ? (
        <h2 className="mb-3">Account Information</h2>
      ) : (
        <h2 className="mb-3">Change Password</h2>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      )}

      {showForms && infoType === "AcctInfo" ? (
        <AcctInfo
          user={user}
          setUser={setAcctUser}
          origUserData={origUserData}
          setInfoType={setInfoType}
        />
      ) : null}

      {showForms && infoType === "Password" ? (
        <ChangePassword user={user} setInfoType={setInfoType} />
      ) : null}
    </div>
  );
};

export default AcctInfoForm;
