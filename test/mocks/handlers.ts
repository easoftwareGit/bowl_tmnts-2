import { http, HttpResponse, HttpHandler } from "msw"; // Correct imports
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
  http.get(testBaseTmntsYearsApi + year, () => {
    return HttpResponse.json({ data: mockYears });
  }),

  // api/tmnts/results/:year
  http.get(testBaseTmntsResultsApi + '2023', () => {
    return HttpResponse.json({ data: mockResults });
  }),

  // api/tmnts/upcoming
  http.get(testBaseTmntsUpcomingApi, () => {
    return HttpResponse.json({ data: mockUpcoming });
  }),

  // /api/bowls
  http.get(testBaseBowlsApi, () => {
    return HttpResponse.json({ data: mockPrismaBowls });
  }),
]