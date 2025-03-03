import { tmntResultsData, calcNumGames, createResultsColumns } from "@/app/results/tmnt/[tmntId]/createColumns";
import { DataGrid } from "@mui/x-data-grid";

const populateRows = (tmntResults: any[]):(typeof tmntResultsData[]) => { 
  const pRows: (typeof tmntResultsData)[] = [];
  const numGames = calcNumGames(tmntResults);
  tmntResults?.forEach((result) => {
    const pRow: typeof tmntResultsData = { ...tmntResultsData };
    pRow.id = result.player_id;
    pRow.player_id = result.player_id;
    pRow.full_name = result.full_name;
    pRow.average = result.average;
    pRow.hdcp = result.hdcp;
    for (let game = 1; game <= numGames; game++) { 
      pRow["Game " + game] = result["Game " + game];
      pRow["Game " + game + " + Hdcp"] = result["Game " + game + " + Hdcp"];
    }
    pRow.total = result.total;
    pRow.total_hdcp = result['total + Hdcp'];
    pRows.push(pRow);    
  })
  
  return pRows;
}

interface ChildProps { 
  divid: string;
  tmntResults: any[];  
}

const TmntResultsForm: React.FC<ChildProps> = ({ divid, tmntResults }) => {   
  
  const justDiv = tmntResults.filter(result => result.div_id === divid);
  let maxHdcp = 0;
  if (justDiv && justDiv.length > 0) {
    maxHdcp = Math.max(...justDiv.map(result => result.hdcp));
  } 
  const rows = populateRows(justDiv);
  const columns = createResultsColumns(justDiv, maxHdcp);

  return (
    <>
      <div
        id="playerEntryGrid"
        style={{ width: "100%", overflow: "auto", marginBottom: 10 }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          editMode="cell"
          rowHeight={25}
          columnHeaderHeight={25}
          hideFooter={true}
        />
      </div>
    </>
  )
}

export default TmntResultsForm;