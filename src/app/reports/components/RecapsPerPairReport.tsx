import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { sortedDivsByOrder, sortedPlayersByLanePos, tmntObjectHasData } from "@/lib/reportTools";
import type { tmntFullType, divEntryType, divType, playerType } from "@/lib/types/types";
import { isOdd } from "@/lib/validation/validation";
import { fullName } from "@/lib/getName";
import { calcHandicap } from "@/lib/db/divEntries/calcHdcp";
import { dateTo_MMddyyyy } from "@/lib/dateTools";

type gridCol = {
  key: string;
  label: string;
  width: number;
  align: "left" | "center" | "right";
}

type Props = {
  tmntFullData: tmntFullType;
  onRender?: () => void;
};

const nameColWidth = 110;
const titleColWidth = 37;
const gameColWidth = 40;
const totalColWidth = 40;

const paddingSize = 2;
const cellFontSize = 10;
const cellHeight = 16;
const lineColor = "#000000";

const styles = StyleSheet.create({
  page: {
    padding: 36,
  },

  title: {
    fontSize: 16,
    marginBottom: 4,
  },

  pairOfLanes: {
    fontSize: 12,
    marginBottom: 4
  },

  tableRow: {
    flexDirection: "row",
  },

  headerCell: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
  },

  headerNameCell: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
  },

  headerTotalCell: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 2,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
  },

  cell: {
    borderTopWidth: 1,
    borderBottomWidth: 0,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
  },

  nameCell: {
    borderTopWidth: 1,
    borderBottomWidth: 0,
    borderLeftWidth: 2,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
    overflow: "hidden",
    height: cellHeight,    
  },

  averageCell: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 2,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
  },

  nameCellPmRow: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 2,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
  },

  totalCell: {
    borderTopWidth: 1,
    borderBottomWidth: 0,
    borderLeftWidth: 1,
    borderRightWidth: 2,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
  },

  lastRowNameCell: {
    borderTopWidth: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
  },

  lastRowCell: {
    borderTopWidth: 1,
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
  },

  lastRowTotalCell: {
    borderTopWidth: 1,
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 2,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
  },

  leftText: {
    textAlign: "left",
  },

  centerText: {
    textAlign: "center",
  },

  rightText: {
    textAlign: "right",
  }  
});

/***************************
 * create columns for grid *
 ***************************/

const clipText = (text: string, maxChars: number): string => {
  return text.length > maxChars ? text.slice(0, maxChars) : text;
};

const createHdcpCols = (player: playerType, games: number, div: divType): gridCol[] => {
  const hdcp = calcHandicap(
    player.average, div.hdcp_from, div.hdcp_per, div.int_hdcp
  );
  const decimals = div.int_hdcp ? 0 : 1;
  const totalHdcp = hdcp * games;
  const nameCol: gridCol = {
    key: "hdcp_name" + player.id,
    label: "Average: " + player.average,
    width: nameColWidth,
    align: "left" 
  }
  const titleCol: gridCol = {
    key: "hdcp_" + player.id,
    label: "Hdcp",
    width: titleColWidth,
    align: "right" 
  }
  const gameCols: gridCol[] = Array.from(
    { length: games },
    (_, i): gridCol => ({
      key: `hdcp_game_${i + 1}_${player.id}`,
      label: hdcp.toFixed(decimals),
      width: gameColWidth,
      align: "right"
    })
  );
  const totalCol: gridCol = {
    key: "hdcp_total_" + player.id,
    label: totalHdcp.toFixed(decimals),
    width: totalColWidth,
    align: "right"
  }
  return [nameCol, titleCol, ...gameCols, totalCol];  
}

const createHeaderCols = (games: number): gridCol[] => {
  const nameCol: gridCol = {
    key: "name", label: "Name", width: nameColWidth, align: "left" 
  }
  const titleCol: gridCol = {
    key: "title", label: "", width: titleColWidth, align: "left" 
  }
  const gameCols: gridCol[] = Array.from(
    { length: games },
    (_, i): gridCol => ({
      key: `game${i + 1}`, label: `Gm ${i + 1}`, width: gameColWidth, align: "center"
    })
  );
  const totalCol: gridCol = {
    key: "total", label: "Total", width: totalColWidth, align: "center"
  }
  return [nameCol, titleCol, ...gameCols, totalCol];
}

const createPlayerCols = (player: playerType, games: number): gridCol[] => {
  const nameClipLength = 20;
  const playerName = clipText(
    fullName(player.first_name, player.last_name),
    nameClipLength
  ).replaceAll(" ", "\u00A0",);
  const nameCol: gridCol = {
    key: "name_" + player.id,
    // label: fullName(player.first_name, player.last_name),
    label: playerName,
    width: nameColWidth,
    align: "left"     
  }
  const titleCol: gridCol = {
    key: "title_" + player.id,
    label: "Score",
    width: titleColWidth,
    align: "right" 
  }
  const gameCols: gridCol[] = Array.from(
    { length: games },
    (_, i): gridCol => ({
      key: `game${i + 1}_${player.id}`, label: "", width: gameColWidth, align: "left"
    })
  );
  const totalCol: gridCol = {
    key: "total_" + player.id, label: "", width: totalColWidth, align: "left"
  }
  return [nameCol, titleCol, ...gameCols, totalCol];  
}

const createPlusMinusCols = (player: playerType, games: number): gridCol[] => {
  const nameCol: gridCol = {
    key: "pm_name" + player.id,
    label: "",
    width: nameColWidth,
    align: "left" 
  }
  const titleCol: gridCol = {
    key: "pm_" + player.id,
    label: "+/-",
    width: titleColWidth,
    align: "right" 
  }
  const gameCols: gridCol[] = Array.from(
    { length: games },
    (_, i): gridCol => ({
      key: `pm_game${i + 1}_${player.id}`, label: "", width: gameColWidth, align: "center"
    })
  );
  const totalCol: gridCol = {
    key: "pm_total_" + player.id, label: "", width: totalColWidth, align: "center"
  }
  return [nameCol, titleCol, ...gameCols, totalCol];  
}

const createTotalsCols = (player: playerType, games: number): gridCol[] => {
  const nameCol: gridCol = {
    key: "total_name_" + player.id,
    label: "",
    width: nameColWidth,
    align: "left" 
  }
  const titleCol: gridCol = {
    key: "total_title" + player.id,
    label: "total",
    width: titleColWidth,
    align: "right" 
  }
  const gameCols: gridCol[] = Array.from(
    { length: games },
    (_, i): gridCol => ({
      key: `total_game${i + 1}_${player.id}`, label: "", width: gameColWidth, align: "center"
    })
  );
  const totalCol: gridCol = {
    key: "total_total_" + player.id, label: "", width: totalColWidth, align: "center"
  }
  return [nameCol, titleCol, ...gameCols, totalCol];  
}

/********************
 * create grid rows *
 ********************/

const createHdcpRow = (plusMinusCols: gridCol[], rowKey: string): React.ReactNode => {
    
  return (
    <View key={rowKey} style={styles.tableRow}>
      {plusMinusCols.map((col, index) => {
        let cellStyle = styles.cell;        

        // first column
        if (index === 0) {
          cellStyle = styles.averageCell;
        }

        // last column
        else if (index === plusMinusCols.length - 1) {
          cellStyle = styles.totalCell;
        }

        const textStyle =
          col.align === "center"
            ? styles.centerText
            : col.align === "right"
              ? styles.rightText
              : styles.leftText;

        return (
          <View
            key={col.key}
            style={[
              cellStyle,
              { width: col.width },
            ]}
          >
            <Text style={textStyle}>
              {col.label}
            </Text>
          </View>
        )
      })}
    </View>    
  )
}

const createHeaderRow = (headerCols: gridCol[], rowKey: string): React.ReactNode => {
  return (
    <View key={rowKey} style={styles.tableRow}>
      {headerCols.map((col, index) => {

        let cellStyle = styles.headerCell;

        // first column
        if (index === 0) {
          cellStyle = styles.headerNameCell;
        }

        // last column
        else if (index === headerCols.length - 1) {
          cellStyle = styles.headerTotalCell;
        }

        const textStyle =
          col.align === "center"
            ? styles.centerText
            : col.align === "right"
              ? styles.rightText
              : styles.leftText;

        return (
          <View
            key={col.key}
            style={[
              cellStyle,
              { width: col.width },
            ]}
          >
            <Text style={textStyle}>
              {col.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const createPlayerRow = (playerCols: gridCol[], rowKey: string): React.ReactNode => {
  
  return (
    <View key={rowKey} style={styles.tableRow}>
      {playerCols.map((col, index) => {
        let cellStyle = styles.cell;        

        // first column
        if (index === 0) {
          cellStyle = styles.nameCell;          
        }

        // last column
        else if (index === playerCols.length - 1) {
          cellStyle = styles.totalCell;
        }

        const textStyle =
          col.align === "center"
            ? styles.centerText
            : col.align === "right"
              ? styles.rightText
              : styles.leftText;

        return (
          <View
            key={col.key}
            style={[
              cellStyle,
              { width: col.width },
            ]}
          >
            <Text style={textStyle}>
              {col.label}
            </Text>
          </View>
        )
      })}
    </View>    
  )
}

const createPlusMinusRow = (
  plusMinusCols: gridCol[],
  lastRow: boolean,
  rowKey: string
): React.ReactNode => {
  
  return (
    <View key={rowKey} style={styles.tableRow}>
      {plusMinusCols.map((col, index) => {
        let cellStyle = lastRow ? styles.lastRowCell : styles.cell;        

        // first column
        if (index === 0) {
          cellStyle = lastRow ? styles.lastRowNameCell : styles.nameCellPmRow;
        }

        // last column
        else if (index === plusMinusCols.length - 1) {
          cellStyle = lastRow ? styles.lastRowTotalCell : styles.totalCell;
        }

        const textStyle =
          col.align === "center"
            ? styles.centerText
            : col.align === "right"
              ? styles.rightText
              : styles.leftText;

        return (
          <View
            key={col.key}
            style={[
              cellStyle,
              { width: col.width },
            ]}
          >
            <Text style={textStyle}>
              {col.label}
            </Text>
          </View>
        )
      })}
    </View>    
  )
}

const createTotalsRow = (
  totalCols: gridCol[],
  lastRow: boolean,
  rowKey: string
): React.ReactNode => {
  
  return (
    <View key={rowKey} style={styles.tableRow}>
      {totalCols.map((col, index) => {
        let cellStyle = lastRow ? styles.lastRowCell : styles.cell;        

        // first column
        if (index === 0) {
          cellStyle = lastRow ? styles.lastRowNameCell : styles.nameCellPmRow;
        }

        // last column
        else if (index === totalCols.length - 1) {
          cellStyle = lastRow ? styles.lastRowTotalCell : styles.totalCell;
        }

        const textStyle =
          col.align === "center"
            ? styles.centerText
            : col.align === "right"
              ? styles.rightText
              : styles.leftText;

        return (
          <View
            key={col.key}
            style={[
              cellStyle,
              { width: col.width },
            ]}
          >
            <Text style={textStyle}>
              {col.label}
            </Text>
          </View>
        )
      })}
    </View>    
  )
}

export default function RecapsPerPairReport({
  tmntFullData,
  onRender,
}: Props) {
  if (!tmntFullData || !tmntObjectHasData(tmntFullData)) {
    // return <div>No tournament data found.</div>;
    return (
      <Document title="No Data" onRender={onRender}>
        <Page size="LETTER" style={styles.page}>
          <Text>No tournament data found.</Text>
        </Page>
      </Document>
    );    
  }

  const tmntName = tmntFullData.tmnt.tmnt_name ?? "";
  const tmntDateStr = tmntFullData.tmnt.start_date_str
    ? dateTo_MMddyyyy(tmntFullData.tmnt.start_date_str)
    : "";
  const games = tmntFullData.events[0].games;

  const sortedPlayers = sortedPlayersByLanePos(tmntFullData.players);
  const sortedDivs = sortedDivsByOrder(tmntFullData.divs);

  const divEntriesByPlayer = new Map<string, divEntryType[]>();
  for (const divEntry of tmntFullData.divEntries) {
    const existing = divEntriesByPlayer.get(divEntry.player_id) ?? [];
    existing.push(divEntry);
    divEntriesByPlayer.set(divEntry.player_id, existing);
  }

  const headerCols = createHeaderCols(games);

  const pages: React.ReactNode[] = [];
  let currentPageRows: React.ReactNode[] = [];
  let leftLane = -1;

  const flushPage = () => {
    if (currentPageRows.length === 0) return;

    pages.push(
      <Page key={`page_${leftLane}`} size="LETTER" style={styles.page}>
        <Text style={styles.title}>{tmntName} {tmntDateStr}</Text>
        <Text style={styles.pairOfLanes}>Lanes {leftLane} & {leftLane + 1}</Text>
        {createHeaderRow(headerCols, `header_${leftLane}`)}
        {currentPageRows}
      </Page>
    );

    currentPageRows = [];
  };

  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i];
    const playerDivEntries = divEntriesByPlayer.get(player.id) ?? [];

    // Start a new page when we hit a new odd lane
    if (isOdd(player.lane) && player.lane !== leftLane) {
      flushPage();
      leftLane = player.lane;
    }

    const isLastRowForLanePair =
      i === sortedPlayers.length - 1 ||
      (!isOdd(sortedPlayers[i].lane) &&
        sortedPlayers[i].lane !== sortedPlayers[i + 1].lane);

    for (const div of sortedDivs) {
      const divEntry = playerDivEntries.find((pde) => pde.div_id === div.id);
      if (!divEntry) continue;

      const playerCols = createPlayerCols(player, games);
      currentPageRows.push(
        createPlayerRow(playerCols, `${player.id}-${div.id}`)
      );

      if (div.hdcp_per > 0) {
        const hdcpCols = createHdcpCols(player, games, div);
        const totalCols = createTotalsCols(player, games);

        currentPageRows.push(
          <View key={`${player.id}-${div.id}-hdcp-block`}>
            {createHdcpRow(hdcpCols, `${player.id}-${div.id}-hdcp`)}
            {createTotalsRow(totalCols, isLastRowForLanePair, `${player.id}-${div.id}-totals`)}
          </View>
        );
      } else {
        const pmCols = createPlusMinusCols(player, games);
        currentPageRows.push(
          <View key={`${player.id}-${div.id}-scratch-block`}>
            {createPlusMinusRow(pmCols, isLastRowForLanePair, `${player.id}-${div.id}-pm`)}
          </View>
        );
      }
    }
  }

  // Flush final page
  flushPage();

  return (
    <Document title="Recaps Per Pair" onRender={onRender}>
      {pages}
    </Document>
  );
}
