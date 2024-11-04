import { testBaseApi } from "./testApi";

describe('initial test setup', () => {

  it('get env test host', () => {
    expect(process.env.TEST_BASE_HOST).toBe('localhost');    
  })
  it('get env test root', () => {    
    expect(process.env.TEST_BASE_ROOT).toBe('http://');
  })
  it('get env test port', () => {    
    expect(process.env.TEST_BASE_PORT).toBe('3000');
  })
  it('get env test base api', () => {    
    expect(process.env.TEST_BASE_API).toBe('/api');
  })
  it('get env test full base api path', () => {
    expect(testBaseApi).toBe('http://localhost:3000/api')
  })
})
