import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OneToNLanes from "@/app/dataEntry/tmntForm/oneToNLanes";
import { mockLanes, mockSquads } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { pairsOfLanes } from "@/components/tmnts/lanesList";
import { tmntActions } from "@/lib/types/types";

const mockSetSquads = jest.fn();
const mockSetLanes = jest.fn();

const mockOneToNLanesProps = {
  lanes: mockLanes,
  setLanes: mockSetLanes,
  squads: mockSquads,
  setSquads: mockSetSquads,
  tmntAction: tmntActions.New,
};

describe("OneToNLanes - Component", () => { 

  describe('Render the component - 1 Squad', () => { 
    const oneSquad = mockSquads.filter(squad => squad.id === 'sqd_e214ede16c5c46a4950e9a48bfeef61a');
    const lanesOneSquad = mockLanes.filter(lane => lane.squad_id === 'sqd_e214ede16c5c46a4950e9a48bfeef61a');

    const justOneSquadProps = {      
      lanes: lanesOneSquad,
      setLanes: mockSetLanes,
      squads: oneSquad,
      setSquads: mockSetSquads,
      tmntAction: tmntActions.New,
    }
    it('should render the component', () => { 
      render(<OneToNLanes {...justOneSquadProps} />)
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    })
    it('should render the "Lanes" and "In Use" column headers', () => { 
      render(<OneToNLanes {...justOneSquadProps} />)
      const tableHeaders = screen.getAllByRole('columnheader', { name: /lanes|in use/i });
      expect(tableHeaders).toHaveLength(2);
    })
    it('should render the lanes rows', () => {
      render(<OneToNLanes {...justOneSquadProps} />)
      const tableRows = screen.getAllByRole('row');
      // 10 data rows + 1 header = 11
      expect(tableRows).toHaveLength(11);
    })
    it('should render have all the cells', () => {
      render(<OneToNLanes {...justOneSquadProps} />)
      const tableCells = screen.getAllByRole('cell');
      expect(tableCells).toHaveLength(20);
    })
    it('should render lanes in table cells', () => { 
      render(<OneToNLanes {...justOneSquadProps} />)
      const tableCells = screen.getAllByRole('cell');      
      expect(tableCells[0]).toHaveTextContent('1 - 2');
      expect(tableCells[2]).toHaveTextContent('3 - 4');
      expect(tableCells[4]).toHaveTextContent('5 - 6');
      expect(tableCells[6]).toHaveTextContent('7 - 8');
      expect(tableCells[8]).toHaveTextContent('9 - 10');
    })

    it('should render checkboxes in the "In Use" column with correct values', () => {
      render(<OneToNLanes {...mockOneToNLanesProps} />)
      const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
      const s1pairs = pairsOfLanes(mockSquads[0].id, mockLanes);
      expect(s1pairs).toHaveLength(10);
      s1pairs.forEach((pair, index) => {      
        expect((checkboxes[index] as HTMLInputElement).checked).toBe(pair.in_use);
      })
    })

    it("render the tabs", async () => {
      const user = userEvent.setup();
      render(<OneToNLanes {...mockOneToNLanesProps} />);
      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[0]); // focus on first tab
      expect(tabs[0]).toHaveTextContent(oneSquad[0].tab_title);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });
  })

  describe("render the component - 2 Squads", () => {

    it('should render the "Lanes" and "In Use" column headers', () => { 
      render(<OneToNLanes {...mockOneToNLanesProps} />)
      const tableHeaders = screen.getAllByRole('columnheader', { name: /lanes|in use/i });
      expect(tableHeaders).toHaveLength(4);
    })
    it('should render the lanes rows', () => {
      render(<OneToNLanes {...mockOneToNLanesProps} />)
      const tableRows = screen.getAllByRole('row');
      // 15 data rows + 2 header rows = 17
      expect(tableRows).toHaveLength(17);
    })
    it('should render have all the cells', () => {
      render(<OneToNLanes {...mockOneToNLanesProps} />)
      const tableCells = screen.getAllByRole('cell');
      expect(tableCells).toHaveLength(30);
    })
    it('should render lanes in table cells', () => { 
      render(<OneToNLanes {...mockOneToNLanesProps} />)
      const tableCells = screen.getAllByRole('cell');      
      expect(tableCells[0]).toHaveTextContent('1 - 2');
      expect(tableCells[2]).toHaveTextContent('3 - 4');
      expect(tableCells[4]).toHaveTextContent('5 - 6');
      expect(tableCells[6]).toHaveTextContent('7 - 8');
      expect(tableCells[8]).toHaveTextContent('9 - 10');
      expect(tableCells[10]).toHaveTextContent('11 - 12');
      expect(tableCells[12]).toHaveTextContent('13 - 14');
      expect(tableCells[14]).toHaveTextContent('15 - 16');
      expect(tableCells[16]).toHaveTextContent('17 - 18');
      expect(tableCells[18]).toHaveTextContent('19 - 20');
      expect(tableCells[20]).toHaveTextContent('1 - 2');
      expect(tableCells[22]).toHaveTextContent('3 - 4');
      expect(tableCells[24]).toHaveTextContent('5 - 6');
      expect(tableCells[26]).toHaveTextContent('7 - 8');
      expect(tableCells[28]).toHaveTextContent('9 - 10');      
    })
    it('should render checkboxes in the "In Use" column with correct values', () => {
      render(<OneToNLanes {...mockOneToNLanesProps} />)
      const checkboxes = screen.getAllByRole('checkbox');

      const s1pairs = pairsOfLanes(mockSquads[0].id, mockLanes);
      expect(s1pairs).toHaveLength(10);
      s1pairs.forEach((pair, index) => {      
        expect((checkboxes[index] as HTMLInputElement).checked).toBe(pair.in_use);
      })

      const s2pairs = pairsOfLanes(mockSquads[1].id, mockLanes);
      expect(s2pairs).toHaveLength(5);
      s2pairs.forEach((pair, index) => {  
        // need to add 10 to index so using squad 2 lanes
        expect((checkboxes[index + 10] as HTMLInputElement).checked).toBe(pair.in_use);
      })
    });
    it("render the tabs", async () => {
      const user = userEvent.setup();
      render(<OneToNLanes {...mockOneToNLanesProps} />);
      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[0]); // focus on first tab
      expect(tabs[0]).toHaveTextContent(mockSquads[0].tab_title);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(tabs[1]).toHaveTextContent(mockSquads[1].tab_title);
      expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    });
  })

  describe('Render the component - TmntAction === Run', () => { 
    const oneSquad = mockSquads.filter(squad => squad.id === 'sqd_e214ede16c5c46a4950e9a48bfeef61a');
    const lanesOneSquad = mockLanes.filter(lane => lane.squad_id === 'sqd_e214ede16c5c46a4950e9a48bfeef61a');

    const justOneSquadProps = {      
      lanes: lanesOneSquad,
      setLanes: mockSetLanes,
      squads: oneSquad,
      setSquads: mockSetSquads,
      tmntAction: tmntActions.Run,
    }
    it('should render checkboxes in the "In Use" column with correct values', () => {
      render(<OneToNLanes {...justOneSquadProps} />)
      const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
      const s1pairs = pairsOfLanes(mockSquads[0].id, mockLanes);
      expect(s1pairs).toHaveLength(10);
      s1pairs.forEach((pair, index) => {      
        expect((checkboxes[index] as HTMLInputElement).checked).toBe(pair.in_use);
        expect((checkboxes[index] as HTMLInputElement).disabled).toBe(true);
      })
    })

    it("render the tabs", async () => {
      const user = userEvent.setup();
      render(<OneToNLanes {...mockOneToNLanesProps} />);
      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[0]); // focus on first tab
      expect(tabs[0]).toHaveTextContent(oneSquad[0].tab_title);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });
  })

  describe('check the In Use checkboxes', () => {
    const oneSquad = mockSquads.filter(squad => squad.id === 'sqd_e214ede16c5c46a4950e9a48bfeef61a');
    const lanesOneSquad = mockLanes.filter(lane => lane.squad_id === 'sqd_e214ede16c5c46a4950e9a48bfeef61a');

    const justOneSquadProps = {      
      lanes: lanesOneSquad,
      setLanes: mockSetLanes,
      squads: oneSquad,
      setSquads: mockSetSquads,
      tmntAction: tmntActions.New
    }

    it('check the "In Use" checkboxes', async () => {
      const user = userEvent.setup();
      render(<OneToNLanes {...justOneSquadProps} />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();

      const s1pairs = pairsOfLanes(oneSquad[0].id, lanesOneSquad);
      expect(s1pairs).toHaveLength(10);

      await user.click(checkboxes[0]);
      expect(checkboxes[0]).not.toBeChecked();

      await user.click(checkboxes[0]);
      expect(checkboxes[0]).toBeChecked();
    })
  })

})