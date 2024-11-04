import { rest } from "msw";
import { mockYears } from "../mocks/tmnts/mockYears";
import { mockResults } from '../mocks/tmnts/mockResults';
import { mockUpcoming } from "../mocks/tmnts/mockUpcoming";
import {
  testBaseTmntsYearsApi,
  testBaseTmntsResultsApi,
  testBaseTmntsUpcomingApi,
  testBaseBowlsApi,
} from "../../test/testApi";
import { mockPrismaBowls } from "./bowls/mockBowls";

const year = new Date().getFullYear().toString();

export const handlers = [

  // api/tmnts/years/:year

  rest.get(testBaseTmntsYearsApi + year, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mockYears }));    
  }),

  // api/tmnts/results/:year

  rest.get(testBaseTmntsResultsApi + '2023', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mockResults }));
  }),

  // api/tmnts/upcoming

  rest.get(testBaseTmntsUpcomingApi, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mockUpcoming }));
  }),

  // /api/bowls

  rest.get(testBaseBowlsApi, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mockPrismaBowls }));
  })
]