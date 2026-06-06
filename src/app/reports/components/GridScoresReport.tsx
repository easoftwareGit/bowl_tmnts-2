import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { clipText, removeByePlayers, sortedPlayersByLanePos, tmntObjectHasData } from "@/lib/reportTools";
import type { 
  tmntFullType, 
  playerType,
  reportGridCol, 
} from "@/lib/types/types";
import { fullName } from "@/lib/getName";
import { dateTo_MMddyyyy } from "@/lib/dateTools";

type Props = {
  tmntFullData: tmntFullType;
  onRender?: () => void;
};

const nameColWidth = 110;
const lanePosColWidth = 37;
const gameColWidth = 40;

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

  gridScoresHeader: {
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

  headerLastGameCell: {
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

  lastGameCell: {
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
    borderTopWidth: 1,
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

  lastRowLastGameCell: {
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

const createHeaderCols = (games: number): reportGridCol[] => {
  const nameCol: reportGridCol = {
    key: "name", label: "Name", width: nameColWidth, align: "left" 
  }
  const lanePosCol: reportGridCol = {
    key: "lanePos", label: "Ln Pos", width: lanePosColWidth, align: "left" 
  }
  const gameCols: reportGridCol[] = Array.from(
    { length: games },
    (_, i): reportGridCol => ({
      key: `game${i + 1}`, label: `Gm ${i + 1}`, width: gameColWidth, align: "center"
    })
  );
  return [nameCol, lanePosCol, ...gameCols];
}

const createPlayerCols = (player: playerType, games: number): reportGridCol[] => {
  const nameClipLength = 20;
  const playerName = clipText(
    fullName(player.first_name, player.last_name),
    nameClipLength
  ).replaceAll(" ", "\u00A0",);
  const nameCol: reportGridCol = {
    key: "name_" + player.id,
    label: playerName,
    width: nameColWidth,
    align: "left"     
  }
  const lanePosCol: reportGridCol = {
    key: "lanePos_" + player.id,
    label: `${player.lane}-${player.position}`,
    width: lanePosColWidth,
    align: "center" 
  }
  const gameCols: reportGridCol[] = Array.from(
    { length: games },
    (_, i): reportGridCol => ({
      key: `game${i + 1}_${player.id}`, label: "", width: gameColWidth, align: "left"
    })
  );
  return [nameCol, lanePosCol, ...gameCols];  
}

/********************
 * create grid rows *
 ********************/

const createHeaderRow = (headerCols: reportGridCol[], rowKey: string): React.ReactNode => {
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
          cellStyle = styles.headerLastGameCell;
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

const createPlayerRow = (playerCols: reportGridCol[], rowKey: string, isLastRow: boolean): React.ReactNode => {
  
  return (
    <View key={rowKey} style={styles.tableRow}>
      {playerCols.map((col, index) => {
        let cellStyle = isLastRow ? styles.lastRowCell : styles.cell;        

        // first column
        if (index === 0) {
          cellStyle = isLastRow ? styles.lastRowNameCell : styles.nameCell;     
        }

        // last column
        else if (index === playerCols.length - 1) {
          cellStyle = isLastRow ? styles.lastRowLastGameCell : styles.lastGameCell;
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

export default function GridScoresReport({
  tmntFullData,
  onRender,
}: Props) {

  const maxRowsPerPage = 41; // Adjust as needed based on page size and cell height

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

  // bye player id's start with "bye", filter them out for this report
  const noByePlayers = removeByePlayers(tmntFullData.players);

  const sortedPlayers = sortedPlayersByLanePos(noByePlayers);
  const headerCols = createHeaderCols(games);

  const pages: React.ReactNode[] = [];
  let currentPageRows: React.ReactNode[] = [];
  let pageNum = 1;

  const flushPage = () => {
    if (currentPageRows.length === 0) return;

    pages.push(
      <Page key={`page_${pageNum}`} size="LETTER" style={styles.page}>
        <Text style={styles.title}>{tmntName} {tmntDateStr}</Text>
        <Text style={styles.gridScoresHeader}>Scores Grid</Text>
        {createHeaderRow(headerCols, `header_${pageNum}`)}
        {currentPageRows}
      </Page>
    );

    currentPageRows = [];
  };

  for (let i = 0; i < sortedPlayers.length; i++) {
    const player = sortedPlayers[i];

    // Start a new page when at max rows per page
    if (currentPageRows.length >= maxRowsPerPage) {
      flushPage();
      pageNum++;
    }

    const isLastRow = ((currentPageRows.length === maxRowsPerPage - 1) || i === sortedPlayers.length - 1);
    const playerCols = createPlayerCols(player, games);
    currentPageRows.push(
      createPlayerRow(playerCols, `${player.id}`, isLastRow)
    );
  }

  // Flush final page
  flushPage();

  return (
    <Document title="Grid Scores" onRender={onRender}>
      {pages}
    </Document>
  );
}