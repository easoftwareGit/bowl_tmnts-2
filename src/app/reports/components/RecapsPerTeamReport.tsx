import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { sortedDivsByOrder, sortedPlayersByLanePos, tmntObjectHasData } from "@/lib/reportTools";
import type { tmntFullType, divEntryType, divType, playerType } from "@/lib/types/types";
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
}

const titleColWidth = 45;
const gameColWidth = 50;
const totalColWidth = 55;

const paddingSize = 2;
const cellFontSize = 10;
const cellHeight = 22;
const lineColor = "#000000";

const styles = StyleSheet.create({
  page: {
    padding: 36,
  },

  title: {
    fontSize: 16,
    marginBottom: 4,
  },

  nonTitleHeader: {
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

  headerTitleCell: {
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

  titleCell: {
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

  cell: {
    borderTopWidth: 1,
    borderBottomWidth: 0,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
    height: cellHeight,
  },

  titleHdcpCell: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 2,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
    height: cellHeight,
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
    height: cellHeight,
  },

  lastRowTitleCell: {
    borderTopWidth: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
    height: cellHeight,
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
    height: cellHeight,
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
    height: cellHeight,
  },

  blankLineCells: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
    height: cellHeight,
  },

  cutLineCells: {
    borderTopWidth: 1,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
    height: cellHeight,
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

const createBlankLineCells = (player: playerType, games: number): gridCol[] => {
  const titleCol: gridCol = {
    key: "bl_title_" + player.id,
    label: "",
    width: titleColWidth,
    align: "center",
  }
  const gameCols: gridCol[] = Array.from(
    { length: games },
    (_, i): gridCol => ({
      key: `bl_game_${i + 1}_${player.id}`,
      label: "",
      width: gameColWidth,
      align: "center",
    }),
  );
  const totalCol: gridCol = {
    key: "bl_total_" + player.id,
    label: "",
    width: totalColWidth,
    align: "right"
  }

  return [titleCol, ...gameCols, totalCol];  
}

const createCutLineCols = (player: playerType, games: number): gridCol[] => {
  const titleCol: gridCol = {
    key: "cl_title_" + player.id,
    label: "",
    width: titleColWidth,
    align: "center",
  }
  const gameCols: gridCol[] = Array.from(
    { length: games },
    (_, i): gridCol => ({
      key: `cl_game_${i + 1}_${player.id}`,
      label: "",
      width: gameColWidth,
      align: "center",
    }),
  );
  const totalCol: gridCol = {
    key: "cl_total_" + player.id,
    label: "",
    width: totalColWidth,
    align: "right"
  }

  return [titleCol, ...gameCols, totalCol];  
}

const createHdcpCols = (player: playerType, games: number, div: divType): gridCol[] => {
  const hdcp = calcHandicap(
    player.average, div.hdcp_from, div.hdcp_per, div.int_hdcp
  );
  const decimals = div.int_hdcp ? 0 : 1;
  const totalHdcp = hdcp * games;
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
      align: "right",
    }),
  );  
  const totalCol: gridCol = {
    key: "hdcp_total_" + player.id,
    label: totalHdcp.toFixed(decimals),
    width: totalColWidth,
    align: "right"
  }
  return [titleCol, ...gameCols, totalCol];  
}

const createHeaderCols = (games: number): gridCol[] => {
  const titleCol: gridCol = {
    key: "title", label: "", width: titleColWidth, align: "left" 
  }
  const gameCols: gridCol[] = Array.from(
    { length: games },
    (_, i):gridCol => ({ 
      key: `game${i + 1}`, label: `Gm ${i + 1}`, width: gameColWidth, align: "center"
    })
  );
  const totalCol: gridCol = {
    key: "total", label: "Total", width: totalColWidth, align: "center"
  }
  return [titleCol, ...gameCols, totalCol];
}

const createPlusMinusCols = (player: playerType, games: number): gridCol[] => {
  const titleCol: gridCol = {
    key: "pm_" + player.id,
    label: "+/-",
    width: titleColWidth,
    align: "right" 
  }
  const gameCols: gridCol[] = Array.from(
    { length: games },
    (_, i):gridCol => ({
      key: `pm_game${i + 1}_${player.id}`, label: "", width: gameColWidth, align: "center"
    })
  );
  const totalCol: gridCol = {
    key: "pm_total_" + player.id, label: "", width: totalColWidth, align: "center"
  }
  return [titleCol, ...gameCols, totalCol];  
}

const createScoreCols = (player: playerType, games: number): gridCol[] => {
  const titleCol: gridCol = {
    key: "title_" + player.id,
    label: "Score",
    width: titleColWidth,
    align: "right" 
  }
  const gameCols: gridCol[] = Array.from(
    { length: games },
    (_, i):gridCol => ({
      key: `game${i + 1}_${player.id}`, label: "", width: gameColWidth, align: "left"
    })
  );
  const totalCol: gridCol = {
    key: "total_" + player.id, label: "", width: totalColWidth, align: "left"
  }
  return [titleCol, ...gameCols, totalCol];  
}

const createTotalsCols = (player: playerType, games: number): gridCol[] => {
  const titleCol: gridCol = {
    key: "total_title" + player.id,
    label: "total",
    width: titleColWidth,
    align: "right" 
  }
  const gameCols: gridCol[] = Array.from({ length: games }, (_, i) => ({
    key: `total_game${i + 1}_${player.id}`,
    label: "",
    width: gameColWidth,
    align: "center"
  }));
  const totalCol: gridCol = {
    key: "total_total_" + player.id, label: "", width: totalColWidth, align: "center"
  }
  return [titleCol, ...gameCols, totalCol];  
}

/********************
 * create grid rows *
 ********************/

const createBlankOrCutRow = (cols: gridCol[], rowKey: string, style: any): React.ReactNode => {
  return (
    <View key={rowKey} style={styles.tableRow}>
      {cols.map((col) => {
        // let cellStyle = styles.blankLineCells;
        let cellStyle = style;

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

const createHdcpRow = (plusMinusCols: gridCol[], rowKey: string): React.ReactNode => {
    
  return (
    <View key={rowKey} style={styles.tableRow}>
      {plusMinusCols.map((col, index) => {
        let cellStyle = styles.cell;        

        // first column
        if (index === 0) {
          cellStyle = styles.titleHdcpCell;
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
          cellStyle = styles.headerTitleCell;
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

const createPlusMinusRow = (
  plusMinusCols: gridCol[],  
  rowKey: string
): React.ReactNode => {
  
  return (
    <View key={rowKey} style={styles.tableRow}>
      {plusMinusCols.map((col, index) => {
        let cellStyle = styles.lastRowCell;

        // first column
        if (index === 0) {
          cellStyle = styles.lastRowTitleCell;
        }

        // last column
        else if (index === plusMinusCols.length - 1) {
          cellStyle = styles.lastRowTotalCell;
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

const createScoresRow = (scoreCols: gridCol[], rowKey: string): React.ReactNode => {
  
  return (
    <View key={rowKey} style={styles.tableRow}>
      {scoreCols.map((col, index) => {
        let cellStyle = styles.cell;        

        // first column
        if (index === 0) {
          cellStyle = styles.titleCell;          
        }

        // last column
        else if (index === scoreCols.length - 1) {
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

const createTotalsRow = (
  totalCols: gridCol[],  
  rowKey: string
): React.ReactNode => {
  
  return (
    <View key={rowKey} style={styles.tableRow}>
      {totalCols.map((col, index) => {
        let cellStyle = styles.lastRowCell;

        // first column
        if (index === 0) {
          cellStyle = styles.lastRowTitleCell;
        }

        // last column
        else if (index === totalCols.length - 1) {
          cellStyle = styles.lastRowTotalCell;
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

export default function RecapsPerTeamReport({
  tmntFullData,
  onRender,
}: Props) {
  if (!tmntFullData || !tmntObjectHasData(tmntFullData)) {
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
  let pageNum = 1;
  let lineCount = 0;
  const maxLineCount = 32;

  const flushPage = () => {
    if (currentPageRows.length === 0) return;

    pages.push(
      <Page key={`page-${pageNum}`} size="LETTER" style={styles.page}>
        {currentPageRows}
      </Page>,
    );

    currentPageRows = [];
  };

  for (const player of sortedPlayers) {
    const playerDivEntries = divEntriesByPlayer.get(player.id) ?? [];

    for (const div of sortedDivs) {
      const divEntry = playerDivEntries.find((pde) => pde.div_id === div.id);
      if (!divEntry) continue;

      const gotHdcp = div.hdcp_per !== 0;

      // Approximate number of report lines this player/div recap uses.
      // Handicap: title, name, ave, lane, header, score, hdcp, total, blank, cut = 10
      // Scratch: title, name, lane, header, score, +/-, blank, cut = 8
      const linesNeeded = gotHdcp ? 10 : 8;

      // Start a new page BEFORE adding this player/div block.
      if (lineCount + linesNeeded > maxLineCount) {
        flushPage();
        pageNum++;
        lineCount = 0;
      }

      const playerName = fullName(player.first_name, player.last_name);
      const scoreCols = createScoreCols(player, games);

      currentPageRows.push(
        <View key={`header-${player.id}-${div.id}`}>
          <Text style={styles.title}>
            {tmntName} {tmntDateStr}
          </Text>
          <Text style={styles.nonTitleHeader}>Name: {playerName}</Text>
          {gotHdcp && (
            <Text style={styles.nonTitleHeader}>Ave: {player.average}</Text>
          )}
          <Text style={styles.nonTitleHeader}>
            Starting Lane: {player.lane} - {player.position}
          </Text>
          {createHeaderRow(headerCols, `header-${player.id}-${div.id}`)}
          {createScoresRow(scoreCols, `${player.id}-${div.id}`)}
        </View>,
      );

      if (div.hdcp_per > 0) {
        const hdcpCols = createHdcpCols(player, games, div);
        const totalCols = createTotalsCols(player, games);

        currentPageRows.push(
          <View key={`${player.id}-${div.id}-hdcp-block`}>
            {createHdcpRow(hdcpCols, `${player.id}-${div.id}-hdcp`)}
            {createTotalsRow(totalCols, `${player.id}-${div.id}-totals`)}
          </View>,
        );
      } else {
        const pmCols = createPlusMinusCols(player, games);

        currentPageRows.push(
          <View key={`${player.id}-${div.id}-scratch-block`}>
            {createPlusMinusRow(pmCols, `${player.id}-${div.id}-pm`)}
          </View>,
        );
      }

      const blankCols = createBlankLineCells(player, games);
      const cutCols = createCutLineCols(player, games);

      currentPageRows.push(
        <View key={`${player.id}-${div.id}-blank-cut`}>
          {createBlankOrCutRow(
            blankCols,
            `${player.id}-${div.id}-blank`,
            styles.blankLineCells,
          )}
          {createBlankOrCutRow(
            cutCols,
            `${player.id}-${div.id}-cut`,
            styles.cutLineCells,
          )}
        </View>,
      );

      lineCount += linesNeeded;
    }
  }

  flushPage();

  return <Document title="Recaps Per Team" onRender={onRender}>{pages}</Document>;
}