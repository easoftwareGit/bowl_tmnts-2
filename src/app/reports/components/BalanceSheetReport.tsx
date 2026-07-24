import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  tmntObjectHasData,
} from "@/lib/reportTools";
import type {
  tmntFullType,
  tmntMoneyType,
  reportGridCol,
} from "@/lib/types/types";
import { dateTo_MMddyyyy } from "@/lib/dateTools";
import { MoneyDescrip, MoneyFlow } from "@prisma/client";
import { getBrktOrElimName, getDivName, getPotName } from "@/lib/getName";
import { localConfig } from "@/lib/currency/const";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";

type reportGroupType = {
  groupId: string,
  mainGroup: string,
  rows: React.ReactNode[],
};

type Props = {
  tmntFullData: tmntFullType;
  onRender?: () => void;
};

const descripColWidth = 80;
const sourceColWidth = 130;
const amountColWidth = 60;
const totalColWidth = 70;

const paddingSize = 2;
const cellFontSize = 10;
const cellHeight = 16;
const lineColor = "#000000";

const styles = StyleSheet.create({
  page: {
    padding: 36,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  title: {
    fontSize: 16,
  },

  pageNumber: {
    fontSize: 10,
    textAlign: "right",
  },

  balanceSheet: {
    fontSize: 12,
    marginBottom: 4,
  },

  tableRow: {
    flexDirection: "row",
  },

  groupHeaderCell: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    fontWeight: "bold",
    justifyContent: "center",
  },

  headerCell: {
    borderTopWidth: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
  },

  cell: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
  },

  totalCell: {
    borderTopWidth: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
  },

  lastRowCell: {
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: lineColor,
    padding: paddingSize,
    fontSize: cellFontSize,
    justifyContent: "center",
  },

  lastRowTotalCell: {
    borderTopWidth: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 0,
    borderRightWidth: 0,
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
  },
});

/***************************
 * create columns for grid *
 ***************************/

const createHeaderCols = (page: number): reportGridCol[] => {
  const pageStr = page.toString();
  const descripCol: reportGridCol = {
    key: "descrip" + pageStr,
    label: "Description",
    width: descripColWidth,
    align: "left",
  };
  const sourceCol: reportGridCol = {
    key: "source" + pageStr,
    label: "",
    width: sourceColWidth,
    align: "left",
  };
  const amountCol: reportGridCol = {
    key: "amount" + pageStr,
    label: "Amount",
    width: amountColWidth,
    align: "right",
  };
  const totalCol: reportGridCol = {
    key: "total" + pageStr,
    label: "",
    width: totalColWidth,
    align: "right",
  };
  return [descripCol, sourceCol, amountCol, totalCol];
};

/********************
 * create grid rows *
 ********************/

const createHeaderRow = (
  headerCols: reportGridCol[],
  rowKey: string,
): React.ReactNode => {
  return (
    <View key={rowKey} style={styles.tableRow}>
      {headerCols.map((col) => {
        const textStyle =
          col.align === "center"
            ? styles.centerText
            : col.align === "right"
              ? styles.rightText
              : styles.leftText;

        return (
          <View key={col.key} style={[styles.headerCell, { width: col.width }]}>
            <Text style={textStyle}>{col.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

const createGroupHeaderRow = (
  key: string,
  text: string,
): React.ReactNode => (
  <View key={key} style={styles.tableRow}>
    <Text style={styles.groupHeaderCell}>{text}</Text>
  </View>
);

const createFlowRow = (
  money: tmntMoneyType,
  tmntFullData: tmntFullType,
  groupType: string,
  lastRow: boolean,
): React.ReactNode => {
  const descrip = getMoneyRowDecrip(money);
  const source = getMoneyRowSource(money, tmntFullData);
  const amount = formatValueSymbSep2Dec(money.amount!.toString(), localConfig);
  const cellStyle = lastRow ? styles.lastRowCell : styles.cell;
  return (
    <View key={money.id + groupType} style={styles.tableRow}>
      <View
        key={money.id + "descrip"}
        style={[cellStyle, { width: descripColWidth }]}
      >
        <Text style={styles.leftText}>{descrip}</Text>
      </View>
      <View
        key={money.id + "source"}
        style={[cellStyle, { width: sourceColWidth }]}
      >
        <Text style={styles.leftText}>{source}</Text>
      </View>
      <View
        key={money.id + "amount"}
        style={[cellStyle, { width: amountColWidth }]}
      >
        <Text style={styles.rightText}>{amount}</Text>
      </View>
    </View>
  );
};

const createTotalRow = (
  key: string,
  totalAmount: number,
  subGroup: boolean = false,
): React.ReactNode => {
  const amount = formatValueSymbSep2Dec(totalAmount!.toString(), localConfig);
  if (subGroup) {
    return (
      <View key={key} style={styles.tableRow}>
        <View
          key={key + "_descrip"}
          style={[styles.cell, { width: descripColWidth }]}
        >
          <Text></Text>
        </View>
        <View
          key={key + "_source"}
          style={[styles.cell, { width: sourceColWidth }]}
        >
          <Text></Text>
        </View>
        <View
          key={key + "_amount"}
          style={[styles.lastRowCell, { width: amountColWidth }]}
        >
          <Text style={styles.rightText}>{amount}</Text>
        </View>
      </View>
    );
  } else {
    return (     
      <View key={key} style={styles.tableRow}>
        <View
          key={key + "_descrip"}
          style={[styles.cell, { width: descripColWidth }]}
        >
          <Text></Text>
        </View>
        <View
          key={key + "_source"}
          style={[styles.cell, { width: sourceColWidth }]}
        >
          <Text></Text>
        </View>
        <View
          key={key + "_amount"}
          style={[styles.cell, { width: amountColWidth }]}
        >
          <Text></Text>
        </View>
        <View
          key={key + "_total"}
          style={[styles.lastRowTotalCell, { width: totalColWidth }]}
        >
          <Text style={styles.rightText}>{amount}</Text>
        </View>
      </View>
    );
  }
};

const createEmptyRow = (key: string): React.ReactNode => {
  return (
    <View key={key+"_emptyRow"} style={styles.tableRow}>
      <View key={key+"_emptyDescrip"} style={[styles.cell, { width: descripColWidth }]}>
        <Text> </Text>
      </View>
    </View>
  )
}

/******************
 * get row values *
 *****************/

const getMoneyRowDecrip = (money: tmntMoneyType): string => {
  switch (money.descrip) {
    case MoneyDescrip.ADDED:
      return "Added Money";
    case MoneyDescrip.ENTRIES:
      return "Entries";
    case MoneyDescrip.EXPENSES:
      return "Expenses";
    case MoneyDescrip.LINEAGE:
      return "Lineage";
    case MoneyDescrip.OTHER:
      return "Other";    
    case MoneyDescrip.PRIZEFUND:
      return "Prize Fund";
    case MoneyDescrip.REFUNDS:
      return "Refunds";
    default:
      return "";
  }
};

const getMoneyRowSource = (
  money: tmntMoneyType,
  tmntFullData: tmntFullType,
): string => {
  switch (money.descrip) {
    case MoneyDescrip.ADDED:
      return "";
    case MoneyDescrip.ENTRIES:
      if (
        money.pot_id == null &&
        money.brkt_id == null &&
        money.elim_id == null
      ) {
        return "Division: " + getDivName(money.div_id, tmntFullData.divs);
      } else if (money.pot_id != null) {
        const pot = tmntFullData.pots.find((pot) => pot.id === money.pot_id);
        return "Pot: " + getPotName(pot!, tmntFullData.divs);
      } else if (money.brkt_id != null) {
        const brkt = tmntFullData.brkts.find(
          (brkt) => brkt.id === money.brkt_id,
        );
        return "Bracket: " + getBrktOrElimName(brkt!, tmntFullData.divs);
      } else if (money.elim_id != null) {
        const elim = tmntFullData.elims.find(
          (elim) => elim.id === money.elim_id,
        );
        return "Eliminator: " + getBrktOrElimName(elim!, tmntFullData.divs);
      } else {
        return "";
      }
    case MoneyDescrip.EXPENSES:
      if (
        money.pot_id == null &&
        money.brkt_id == null &&
        money.elim_id == null
      ) {
        return "Divisions";
      } else if (money.pot_id != null) {
        const pot = tmntFullData.pots.find((pot) => pot.id === money.pot_id);
        return "Pot: " + getPotName(pot!, tmntFullData.divs);
      } else if (money.brkt_id != null) {
        const brkt = tmntFullData.brkts.find(
          (brkt) => brkt.id === money.brkt_id,
        );
        return "Bracket: " + getBrktOrElimName(brkt!, tmntFullData.divs);
      } else if (money.elim_id != null) {
        const elim = tmntFullData.elims.find(
          (elim) => elim.id === money.elim_id,
        );
        return "Eliminator: " + getBrktOrElimName(elim!, tmntFullData.divs);
      } else {
        return "";
      }
    case MoneyDescrip.LINEAGE:
      return "";
    case MoneyDescrip.OTHER:
      return "";    
    case MoneyDescrip.PRIZEFUND:
      if (
        money.pot_id == null &&
        money.brkt_id == null &&
        money.elim_id == null
      ) {
        return "Division: " + getDivName(money.div_id, tmntFullData.divs);
      } else if (money.pot_id != null) {
        const pot = tmntFullData.pots.find((pot) => pot.id === money.pot_id);
        return "Pot: " + getPotName(pot!, tmntFullData.divs);
      } else if (money.brkt_id != null) {
        const brkt = tmntFullData.brkts.find(
          (brkt) => brkt.id === money.brkt_id,
        );
        return "Bracket: " + getBrktOrElimName(brkt!, tmntFullData.divs);
      } else if (money.elim_id != null) {
        const elim = tmntFullData.elims.find(
          (elim) => elim.id === money.elim_id,
        );
        return "Eliminator: " + getBrktOrElimName(elim!, tmntFullData.divs);
      } else {
        return "";
      }
    case MoneyDescrip.REFUNDS:
      if (money.brkt_id != null) {
        const brkt = tmntFullData.brkts.find(
          (brkt) => brkt.id === money.brkt_id,
        );
        return "Bracket: " + getBrktOrElimName(brkt!, tmntFullData.divs);
      } else {
        return "";
      }
    default:
      return "";
  }
};

/*************
 * get flows *
 *************/

const sortedFlows = (
  moneys: tmntMoneyType[],
  flow: MoneyFlow,
): tmntMoneyType[] => {
  const inFlows = moneys.filter((money) => money.flow === flow);
  return inFlows.sort((a, b) => a.sort_order - b.sort_order);
};

const sortedExpenses = (moneys: tmntMoneyType[]): tmntMoneyType[] => {
  const expenses = moneys.filter(
    (money) => money.descrip === MoneyDescrip.EXPENSES,
  );
  return expenses.sort((a, b) => a.sort_order - b.sort_order);
};

/**********
 * Report *
 **********/

export default function BalanceSheetReport({
  tmntFullData,
  onRender,
}: Props) {

  const maxRowsPerPage = 41; // Adjust as needed based on page size and cell height  

  if (!tmntFullData || !tmntObjectHasData(tmntFullData) || !tmntFullData.moneys || tmntFullData.moneys.length == 0) {
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

  const inFlows = sortedFlows(tmntFullData.moneys, MoneyFlow.IN);
  const outFlows = sortedFlows(tmntFullData.moneys, MoneyFlow.OUT);

  const expenses = sortedExpenses(tmntFullData.moneys);

  const groupRows: React.ReactNode[] = [];
  const reportGroups: reportGroupType[] = [];

  const pages: React.ReactNode[] = [];
  let currentPageRows: React.ReactNode[] = [];
  let pageNumber = 1;

  const headerCols = createHeaderCols(pageNumber);
  // const groupHeaderCols = createGroupHeaderCols(pageNumber);

  const flushPage = () => {
    if (currentPageRows.length === 0) return;

    pages.push(
      <Page key={`page_${pageNumber}`} size="LETTER" style={styles.page}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            {tmntName} {tmntDateStr}
          </Text>
          {/* use react-pdf page number component */}
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
            fixed
          />
        </View>
        <Text style={styles.balanceSheet}>Balance Sheet</Text>
        {createHeaderRow(headerCols, `header_${pageNumber}`)}
        {currentPageRows}
      </Page>,
    );

    pageNumber++;
    currentPageRows = [];
  };

  const isLastInSubGroup = (i: number) => {
    if (i === outFlows.length - 1) return true;
    if (
      outFlows[i].pot_id !== outFlows[i + 1].pot_id ||
      outFlows[i].brkt_id !== outFlows[i + 1].brkt_id ||
      outFlows[i].elim_id !== outFlows[i + 1].elim_id
    )
      return true;
    return false;
  };

  // start with in flows
  const totalInFlows = inFlows.reduce(
    (total, inFlow) => total + inFlow.amount!,
    0,
  );
  let lastRow = false;    
  groupRows.push(createGroupHeaderRow(`inFlowsheader_${pageNumber}`, "In Flows"));
  for (let i = 0; i < inFlows.length; i++) {
    const inFlow = inFlows[i];
    if (i === inFlows.length - 1) lastRow = true;
    groupRows.push(createFlowRow(inFlow, tmntFullData, "inflows", lastRow));
  }
  groupRows.push(createTotalRow("totalInFlows", totalInFlows));
  reportGroups.push({groupId: "inFlows", mainGroup: "In Flows", rows: [...groupRows]});

  // out flows 
  groupRows.length = 0;
  const totalOutFlows = outFlows.reduce(
    (total, divOutFlows) => total + divOutFlows.amount!,
    0,
  );  
  groupRows.push(createGroupHeaderRow(`outFlowsHeader_${pageNumber}`, "Out Flows"));
  let subGroupTotal = 0;  
  for (let i = 0; i < outFlows.length; i++) {
    const outFlow = outFlows[i];
    lastRow = isLastInSubGroup(i);
    subGroupTotal += outFlow.amount!;
    groupRows.push(createFlowRow(outFlow, tmntFullData, "outFlows", lastRow));
    if (lastRow) {
      const keyStart = "subGroupTotal";
      let key = keyStart + outFlow.div_id; 
      if (outFlow.pot_id !== null) {
        key = keyStart + outFlow.pot_id;
      } else if (outFlow.brkt_id !== null) {
        key = keyStart + outFlow.brkt_id;
      } else if (outFlow.elim_id !== null) {
        key = keyStart + outFlow.elim_id;
      }
      groupRows.push(createTotalRow(key, subGroupTotal, true));
      // if not the last outflow row, add an empty row
      if (i !== outFlows.length - 1) {
        groupRows.push(createEmptyRow(outFlow.id));
      // else add the outflows total row
      } else { 
        groupRows.push(createTotalRow("totalOutFlows", totalOutFlows));
        groupRows.push(createEmptyRow(outFlow.id));
      }
      reportGroups.push({groupId: key, mainGroup: "Out Flows", rows: [...groupRows]});

      // reset for next group
      groupRows.length = 0;
      subGroupTotal = 0;
    }
  }

  // add expenses excluding linage and other  
  groupRows.length = 0;
  const totalExpenses = expenses.reduce(
    (total, expenses) => total + expenses.amount!,
    0,
  );  
  groupRows.push(createGroupHeaderRow(
    `expensesHeader_${pageNumber}`,
    "Expenses excluding Lineage and Other"
  ));
  for (let i = 0; i < expenses.length; i++) { 
    const expense = expenses[i];    
    groupRows.push(createFlowRow(expense, tmntFullData, "expenses",lastRow));
  }
  groupRows.push(createTotalRow("totalExpenses", totalExpenses, true));
  reportGroups.push({
    groupId: "expenses",
    mainGroup: "Expenses excluding Lineage and Other",
    rows: [...groupRows]
  });
  
  let lastMainGroupOnPage = "";
  // now flush/print the groups
  for (const reportGroup of reportGroups) {

    // Will this group fit on the current page?
    if (
      currentPageRows.length > 0 &&
      currentPageRows.length + reportGroup.rows.length > maxRowsPerPage
    ) {
      // Remember which main group was on the page we are finishing.
      const previousMainGroup = lastMainGroupOnPage;

      flushPage();

      // if continuing the same main group, use a "continued" header.
      if (reportGroup.mainGroup === previousMainGroup) {
        currentPageRows.push(
          createGroupHeaderRow(
            `continued_${pageNumber}`,
            `${reportGroup.mainGroup} - continued`,
          )
        );
      }
    }

    currentPageRows.push(...reportGroup.rows);

    // Remember the last main group placed on this page.
    lastMainGroupOnPage = reportGroup.mainGroup;
  }  

  // flush the last page
  if (currentPageRows.length > 0) {
    flushPage();
  }

  return (
    <Document title="Balance Sheet" onRender={onRender}>
      {pages}
    </Document>
  );  
}
