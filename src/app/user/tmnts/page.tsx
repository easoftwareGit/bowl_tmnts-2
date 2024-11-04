"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useSession } from "next-auth/react"; 
import Link from "next/link";
import { fetchUserTmnts, getUserTmntError, getUserTmntStatus, deleteUserTmnt } from "@/redux/features/userTmnts/userTmntsSlice";
import { tmntsListType } from "@/lib/types/types";
import { dateTo_UTC_MMddyyyy } from "@/lib/dateTools";
import ModalConfirm from "@/components/modal/confirmModal";
import { initModalObj } from "@/components/modal/modalObjType";
import { fetchBowls, getBowlsError, getBowlsLoadStatus } from "@/redux/features/bowls/bowlsSlice";
import "./userTmnts.css";

export default function UserTmntsPage() { 
  const dispatch = useDispatch<AppDispatch>();

  const { status, data } = useSession();
  const userId = data?.user?.id || ""; 

  useEffect(() => {
    dispatch(fetchUserTmnts(userId));
  }, [userId, dispatch]);

  useEffect(() => { 
    dispatch(fetchBowls());
  }, [dispatch]);

  const stateUserTmnts = useSelector((state: RootState) => state.userTmnts); 
  const userTmnts: tmntsListType[] = stateUserTmnts.userTmnts

  const userTmntsStatus = useSelector(getUserTmntStatus);  
  const userTmntsError = useSelector(getUserTmntError);
  const bowlsStatus = useSelector(getBowlsLoadStatus);
  const bowlsError = useSelector(getBowlsError);  

  const [confModalObj, setConfModalObj] = useState(initModalObj);

  const confirmedDelete = () => {    
    const idToDel = confModalObj.id
    setConfModalObj(initModalObj); // reset modal object (hides modal)
    dispatch(deleteUserTmnt(idToDel)); 
  };

  const canceledDelete = () => {    
    setConfModalObj(initModalObj); // reset modal object (hides modal)
  };

  const handleDeleteClick = (tmntId: string) => { 

    const toDel = userTmnts.find((tmnt) => tmnt.id === tmntId);
    if (!toDel) return;    
    setConfModalObj({
      show: true,
      title: "Delete Tournament",
      message: "Are you sure you want to delete the tournament: \n" + 
               "Name: " + toDel.tmnt_name + "\n" + 
               "Start Date: " + dateTo_UTC_MMddyyyy(new Date(toDel.start_date)) + "\n" +
               "Center: " + toDel.bowls.bowl_name + "\n" +
               "Location: " + toDel.bowls.city + ", " + toDel.bowls.state,
      id: tmntId,
    });
  }

  return (
    <>
      <ModalConfirm
        show={confModalObj.show}
        title={confModalObj.title}
        message={confModalObj.message}
        onConfirm={confirmedDelete}
        onCancel={canceledDelete}
      />
      {(userTmntsStatus === 'loading' || bowlsStatus === 'loading') && <div>Loading...</div>}
      {userTmntsStatus !== 'loading' && userTmntsError
        ? (<div>Error: {userTmntsError}</div>
        ) : null}
      {bowlsStatus !== 'loading' && bowlsError
        ? (<div>Error: {bowlsError}</div>
        ) : null}
      {(userTmntsStatus === 'succeeded' && bowlsStatus === 'succeeded') ? ( 
        <div className="container">
          <div className="row g-3 mb-3 justify-content-md-center align-items-center">      
            <div className="col-md-auto">
              <Link className="btn btn-success" href="/dataEntry/newTmnt">
                &nbsp;&nbsp;New Tournament
              </Link> 
            </div>
          </div>
          <div className="row g-1 mb-1 justify-content-md-center align-items-center">      
            <div className="flex-grow-1 bg-secondary-subtle"></div>
            {/* style width is in pixels */}
            <div
              className="d-flex justify-content-center tmnt_table bg-primary-subtle"
              // style={{ width: 768 }}
            >
              <table className="table table-striped table-hover w-100">
                <thead>
                  <tr className="tmnts-header-row">
                    <th className="align-middle" style={{ width: 220 }}>
                      Tournament
                    </th>
                    <th className="align-middle" style={{ width: 95 }}>
                      Start Date
                    </th>
                    <th className="align-middle" style={{ width: 250 }}>
                      Center
                    </th>
                    <th className="align-middle" style={{ width: 250, textAlign: "center" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userTmnts.map((tmnt) => (
                    <tr key={tmnt.id}>
                      <td className="align-middle">{tmnt.tmnt_name}</td>                      
                      <td className="align-middle">{dateTo_UTC_MMddyyyy(new Date(tmnt.start_date))}</td>
                      <td className="align-middle">{tmnt.bowls.bowl_name}</td>                      
                      <td className="align-middle" style={{ textAlign: "center" }}>
                        <Link
                          className="btn btn-info"
                          href={`/dataEntry/editTmnt/${tmnt.id}`}
                        >
                          Edit
                        </Link>&nbsp;&nbsp;
                      {/*<button
                          type="button"
                          className="btn btn-info"                          
                        >
                          Edit
                        </button>&nbsp;&nbsp; */}
                        <button
                          type="button"
                          className="btn btn-primary"
                        >
                          Run
                        </button>&nbsp;&nbsp;
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleDeleteClick(tmnt.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>    
      ) : null}
    </>
  );

}