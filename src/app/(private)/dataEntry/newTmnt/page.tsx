"use client";
import React, { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import TmntDataForm from "../tmntForm/tmntForm";
import WaitModal from "@/components/modal/waitModal";
import type { tmntFormDataType } from "@/lib/types/types";
import { tmntFormParent } from "@/lib/enums/enums";
import { getBlankTmntFullData } from "@/app/(private)/dataEntry/tmntForm/tmntTools";
import { SquadStage } from "@prisma/client";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

const NewTmntPage = () => {
  const { status, data } = useSession();
  const userId = data?.user?.id ?? "";

  // build the blank tournament once per user, not on every render
  const dataOneTmnt = useMemo<tmntFormDataType>(() => {
    const blankTmnt = getBlankTmntFullData();
    blankTmnt.tmnt.user_id = userId;
    return {
      tmntFullData: blankTmnt,
      stage: SquadStage.DEFINE,
      parentForm: tmntFormParent.NEW,
    };
  }, [userId]);

  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const markPendingChanges = useCallback((pending: boolean): void => {
    setHasPendingChanges(pending);
  }, []);

  useUnsavedChangesGuard(hasPendingChanges);

  // the form copies its props when it mounts, so wait for the user id
  if (status === "loading") {
    return <WaitModal show={true} message="Loading..." />;
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <div className="shadow p-3 m-3 rounded-3 container">
        <h2 className="mb-3">New Tournament</h2>
        <TmntDataForm
          tmntProps={dataOneTmnt}
          markPendingChanges={markPendingChanges}
        />
      </div>
    </div>
  );
};

export default NewTmntPage;